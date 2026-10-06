// Regras de EMISSÃO DE CERTIFICADO.
//
// Para emitir:
//   1. matrícula existe e é do aluno
//   2. matrícula NÃO está trancada
//   3. ainda não existe certificado para ela
//   4. todas as avaliações foram lançadas (soma dos pesos = 100)
//   5. média ponderada >= MIN_AVERAGE_FOR_CERTIFICATE (7,0) - comparada já arredondada em 2 casas
//
// Ao emitir: cria o certificado e conclui a matrícula (COMPLETED) numa só transação.
// Matrícula COMPLETED é o que vale como "pré-requisito cumprido" nas próximas matrículas.

import { randomUUID } from 'node:crypto';
import { BUSINESS_RULES } from '../constants/businessRules.js';
import { ENROLLMENT_STATUS } from '../constants/statuses.js';
import {
  BusinessRuleError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../errors/AppError.js';

export class CertificateService {
  constructor({
    certificateModel,
    enrollmentModel,
    gradeService,
    emailGateway,
    generateCode = () => `CERT-${randomUUID()}`, // injetável para ter código previsível nos testes
    rules = BUSINESS_RULES,
    logger = console,
  }) {
    this.certificateModel = certificateModel;
    this.enrollmentModel = enrollmentModel;
    this.gradeService = gradeService;
    this.emailGateway = emailGateway;
    this.generateCode = generateCode;
    this.rules = rules;
    this.logger = logger;
  }

  async issueCertificate(userId, enrollmentId) {
    const enrollment = await this.enrollmentModel.getEnrollmentById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundError('Matrícula não encontrada.');
    }

    if (enrollment.users_id_fk !== userId) {
      throw new ForbiddenError('Você não tem permissão para emitir o certificado desta matrícula.');
    }

    if (enrollment.status === ENROLLMENT_STATUS.LOCKED) {
      throw new BusinessRuleError('Matrícula trancada não pode emitir certificado.');
    }

    const existingCertificate = await this.certificateModel.getCertificateByEnrollmentId(enrollmentId);
    if (existingCertificate) {
      throw new ConflictError('O certificado desta matrícula já foi emitido.');
    }

    const { total_weight, average } = await this.gradeService.calculateSummary(enrollmentId);

    if (total_weight < this.rules.TOTAL_GRADE_WEIGHT) {
      throw new BusinessRuleError(
        'Existem avaliações pendentes: a soma dos pesos lançados ainda não chegou a 100%.',
        { total_weight }
      );
    }

    if (average < this.rules.MIN_AVERAGE_FOR_CERTIFICATE) {
      throw new BusinessRuleError(
        `Média insuficiente para emitir o certificado: ${average} (mínimo ${this.rules.MIN_AVERAGE_FOR_CERTIFICATE}).`,
        { average, minimum_average: this.rules.MIN_AVERAGE_FOR_CERTIFICATE }
      );
    }

    const certificate = await this.certificateModel.createCertificateAndCompleteEnrollment({
      enrollments_id_fk: enrollmentId,
      code: this.generateCode(),
      average,
    });

    await this.#sendCertificateEmail(enrollment, certificate);

    return certificate;
  }

  async listUserCertificates(userId) {
    return await this.certificateModel.getCertificatesByUserId(userId);
  }

  // E-mail é efeito colateral: se falhar, o certificado continua emitido.
  async #sendCertificateEmail(enrollment, certificate) {
    try {
      await this.emailGateway.sendEmail({
        to: enrollment.users.email,
        subject: 'Seu certificado está disponível',
        body: `Parabéns, ${enrollment.users.name}! Você concluiu "${enrollment.classes.courses.title}". Código do certificado: ${certificate.code}.`,
      });
    } catch (error) {
      this.logger.error('Falha ao enviar e-mail do certificado:', error.message);
    }
  }
}
