// Regras de MATRÍCULA, VAGAS, PRÉ-REQUISITOS e TRANCAMENTO.
//
// Matricular (enroll) - checagens, nesta ordem:
//   1. aluno e turma existem
//   2. turma está OPEN
//   3. aluno não está matriculado/trancado nesta turma, nem já concluiu ou cursa o mesmo curso
//   4. aluno concluiu (COMPLETED) todos os pré-requisitos do curso
//   5. há vaga: matrículas ACTIVE < max_students
//   6. cria a matrícula e envia e-mail de confirmação (falha no e-mail NÃO desfaz a matrícula)
//
// Trancar (lockEnrollment):
//   - só matrícula ACTIVE, do próprio aluno
//   - só até LOCK_DEADLINE_PERCENT % da duração da turma
//   - máximo de MAX_LOCKED_ENROLLMENTS_PER_USER matrículas trancadas ao mesmo tempo
//   - trancar libera a vaga da turma
//
// Reativar (reactivateEnrollment):
//   - só matrícula LOCKED, turma OPEN e ainda não encerrada, e precisa haver vaga de novo
//
// Obs.: contar vagas e criar a matrícula não é atômico; em produção com muita concorrência
// seria preciso uma transação/lock para evitar estourar o limite.

import { BUSINESS_RULES } from '../constants/businessRules.js';
import { CLASS_STATUS, ENROLLMENT_STATUS } from '../constants/statuses.js';
import {
  BusinessRuleError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../errors/AppError.js';

export class EnrollmentService {
  constructor({
    enrollmentModel,
    classModel,
    courseModel,
    userModel,
    emailGateway,
    clock = () => new Date(), // injetável para testar regras que dependem de data
    rules = BUSINESS_RULES,
    logger = console,
  }) {
    this.enrollmentModel = enrollmentModel;
    this.classModel = classModel;
    this.courseModel = courseModel;
    this.userModel = userModel;
    this.emailGateway = emailGateway;
    this.clock = clock;
    this.rules = rules;
    this.logger = logger;
  }

  // ---------- Matricular ----------

  async enroll(userId, classId) {
    const user = await this.userModel.findUserById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    const turma = await this.classModel.getClassById(classId);
    if (!turma) {
      throw new NotFoundError('Turma não encontrada.');
    }

    if (turma.status !== CLASS_STATUS.OPEN) {
      throw new BusinessRuleError('A turma não está aberta para matrículas.');
    }

    const userEnrollments = await this.enrollmentModel.getEnrollmentsByUser(userId);

    this.#assertNotAlreadyEnrolled(userEnrollments, turma);
    await this.#assertPrerequisitesMet(turma.courses_id_fk, userEnrollments);
    await this.#assertHasVacancy(turma);

    const enrollment = await this.enrollmentModel.createEnrollment({
      users_id_fk: userId,
      classes_id_fk: classId,
    });

    await this.#sendConfirmationEmail(user, turma);

    return enrollment;
  }

  async listUserEnrollments(userId) {
    return await this.enrollmentModel.getEnrollmentsByUser(userId);
  }

  // ---------- Trancamento ----------

  async lockEnrollment(userId, enrollmentId) {
    const enrollment = await this.#getOwnedEnrollment(userId, enrollmentId);

    if (enrollment.status === ENROLLMENT_STATUS.LOCKED) {
      throw new ConflictError('Esta matrícula já está trancada.');
    }
    if (enrollment.status !== ENROLLMENT_STATUS.ACTIVE) {
      throw new BusinessRuleError('Apenas matrículas ativas podem ser trancadas.');
    }

    const now = this.clock();
    if (this.#isLockDeadlineExceeded(enrollment.classes, now)) {
      throw new BusinessRuleError(
        `Prazo de trancamento encerrado: só é possível trancar até ${this.rules.LOCK_DEADLINE_PERCENT}% da duração da turma.`
      );
    }

    const lockedCount = await this.enrollmentModel.countEnrollmentsByUserAndStatus(
      userId,
      ENROLLMENT_STATUS.LOCKED
    );
    if (lockedCount >= this.rules.MAX_LOCKED_ENROLLMENTS_PER_USER) {
      throw new BusinessRuleError(
        `Limite de ${this.rules.MAX_LOCKED_ENROLLMENTS_PER_USER} matrículas trancadas atingido.`
      );
    }

    return await this.enrollmentModel.updateEnrollment(enrollmentId, {
      status: ENROLLMENT_STATUS.LOCKED,
      locked_at: now,
    });
  }

  async reactivateEnrollment(userId, enrollmentId) {
    const enrollment = await this.#getOwnedEnrollment(userId, enrollmentId);

    if (enrollment.status !== ENROLLMENT_STATUS.LOCKED) {
      throw new BusinessRuleError('Apenas matrículas trancadas podem ser reativadas.');
    }

    const turma = enrollment.classes;

    if (turma.status !== CLASS_STATUS.OPEN) {
      throw new BusinessRuleError('A turma não está aberta; não é possível reativar a matrícula.');
    }
    if (this.clock() > new Date(turma.end_date)) {
      throw new BusinessRuleError('A turma já foi encerrada; não é possível reativar a matrícula.');
    }

    // A vaga foi liberada no trancamento, então precisa haver vaga de novo
    const activeCount = await this.enrollmentModel.countEnrollmentsByClassAndStatus(
      turma.id_classes_pk,
      ENROLLMENT_STATUS.ACTIVE
    );
    if (activeCount >= turma.max_students) {
      throw new ConflictError('Turma lotada: não há vaga para reativar a matrícula.');
    }

    return await this.enrollmentModel.updateEnrollment(enrollmentId, {
      status: ENROLLMENT_STATUS.ACTIVE,
      locked_at: null,
    });
  }

  // ---------- Regras internas ----------

  async #getOwnedEnrollment(userId, enrollmentId) {
    const enrollment = await this.enrollmentModel.getEnrollmentById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundError('Matrícula não encontrada.');
    }
    if (enrollment.users_id_fk !== userId) {
      throw new ForbiddenError('Você não tem permissão para alterar esta matrícula.');
    }
    return enrollment;
  }

  #assertNotAlreadyEnrolled(userEnrollments, turma) {
    const sameClass = userEnrollments.find((e) => e.classes_id_fk === turma.id_classes_pk);
    if (sameClass) {
      if (sameClass.status === ENROLLMENT_STATUS.LOCKED) {
        throw new ConflictError('Sua matrícula nesta turma está trancada. Reative-a em vez de se matricular de novo.');
      }
      throw new ConflictError('Você já está matriculado nesta turma.');
    }

    const sameCourse = userEnrollments.filter(
      (e) => e.classes.courses_id_fk === turma.courses_id_fk
    );

    if (sameCourse.some((e) => e.status === ENROLLMENT_STATUS.COMPLETED)) {
      throw new ConflictError('Você já concluiu este curso.');
    }
    if (sameCourse.some((e) => e.status === ENROLLMENT_STATUS.ACTIVE)) {
      throw new ConflictError('Você já possui matrícula ativa neste curso em outra turma.');
    }
  }

  async #assertPrerequisitesMet(courseId, userEnrollments) {
    const prerequisites = await this.courseModel.getPrerequisitesByCourseId(courseId);

    const completedCourseIds = new Set(
      userEnrollments
        .filter((e) => e.status === ENROLLMENT_STATUS.COMPLETED)
        .map((e) => e.classes.courses_id_fk)
    );

    const missing = prerequisites.filter((p) => !completedCourseIds.has(p.id_courses_pk));

    if (missing.length > 0) {
      throw new BusinessRuleError(
        `Pré-requisitos não cumpridos: ${missing.map((p) => p.title).join(', ')}.`,
        { missing_prerequisites: missing }
      );
    }
  }

  async #assertHasVacancy(turma) {
    const activeCount = await this.enrollmentModel.countEnrollmentsByClassAndStatus(
      turma.id_classes_pk,
      ENROLLMENT_STATUS.ACTIVE
    );

    if (activeCount >= turma.max_students) {
      throw new ConflictError('Turma lotada: não há vagas disponíveis.');
    }
  }

  // Prazo = início + LOCK_DEADLINE_PERCENT % da duração. No instante exato do prazo ainda é permitido.
  #isLockDeadlineExceeded({ start_date, end_date }, now) {
    const start = new Date(start_date).getTime();
    const end = new Date(end_date).getTime();
    const deadline = start + (end - start) * (this.rules.LOCK_DEADLINE_PERCENT / 100);

    return now.getTime() > deadline;
  }

  // E-mail é efeito colateral: se falhar, só registra o erro e mantém a matrícula.
  async #sendConfirmationEmail(user, turma) {
    try {
      await this.emailGateway.sendEmail({
        to: user.email,
        subject: 'Matrícula confirmada',
        body: `Olá, ${user.name}! Sua matrícula na turma "${turma.name}" foi confirmada.`,
      });
    } catch (error) {
      this.logger.error('Falha ao enviar e-mail de confirmação de matrícula:', error.message);
    }
  }
}
