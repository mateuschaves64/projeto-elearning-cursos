// Regras de NOTAS.
//
// Lançar nota:
//   - matrícula existe e está ACTIVE (trancada ou concluída não recebe nota)
//   - nota entre MIN_GRADE e MAX_GRADE (0 a 10)
//   - peso > 0 e a soma dos pesos da matrícula não pode passar de TOTAL_GRADE_WEIGHT (100)
//   - não repete o título da avaliação na mesma matrícula
//
// Média: MÉDIA PONDERADA = soma(nota * peso) / soma(pesos), arredondada para 2 casas.

import { BUSINESS_RULES } from '../constants/businessRules.js';
import { ENROLLMENT_STATUS, USER_ROLES } from '../constants/statuses.js';
import {
  BusinessRuleError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../errors/AppError.js';

const round2 = (number) => Math.round(number * 100) / 100;

export class GradeService {
  constructor({ gradeModel, enrollmentModel, rules = BUSINESS_RULES }) {
    this.gradeModel = gradeModel;
    this.enrollmentModel = enrollmentModel;
    this.rules = rules;
  }

  async launchGrade({ enrollments_id_fk, title, value, weight }) {
    if (typeof value !== 'number' || Number.isNaN(value) ||
        value < this.rules.MIN_GRADE || value > this.rules.MAX_GRADE) {
      throw new BusinessRuleError(
        `A nota deve estar entre ${this.rules.MIN_GRADE} e ${this.rules.MAX_GRADE}.`
      );
    }

    if (typeof weight !== 'number' || Number.isNaN(weight) || weight <= 0) {
      throw new BusinessRuleError('O peso da avaliação deve ser maior que zero.');
    }

    const enrollment = await this.enrollmentModel.getEnrollmentById(enrollments_id_fk);
    if (!enrollment) {
      throw new NotFoundError('Matrícula não encontrada.');
    }

    if (enrollment.status !== ENROLLMENT_STATUS.ACTIVE) {
      const reason = enrollment.status === ENROLLMENT_STATUS.LOCKED ? 'trancada' : 'concluída';
      throw new BusinessRuleError(`Não é possível lançar notas em matrícula ${reason}.`);
    }

    const existingGrades = await this.gradeModel.getGradesByEnrollmentId(enrollments_id_fk);

    const normalizedTitle = title.trim().toLowerCase();
    if (existingGrades.some((g) => g.title.trim().toLowerCase() === normalizedTitle)) {
      throw new ConflictError('Já existe uma avaliação com este título para a matrícula.');
    }

    const newTotalWeight = round2(this.#sumWeights(existingGrades) + weight);
    if (newTotalWeight > this.rules.TOTAL_GRADE_WEIGHT) {
      throw new BusinessRuleError(
        `A soma dos pesos não pode ultrapassar ${this.rules.TOTAL_GRADE_WEIGHT}% (ficaria em ${newTotalWeight}%).`
      );
    }

    return await this.gradeModel.createGrade({
      enrollments_id_fk,
      title: title.trim(),
      value,
      weight,
    });
  }

  // Média ponderada de uma lista de notas (método puro, sem banco)
  calculateAverage(grades) {
    const totalWeight = this.#sumWeights(grades);
    if (totalWeight === 0) return 0;

    const weightedSum = grades.reduce((sum, g) => sum + g.value * g.weight, 0);
    return round2(weightedSum / totalWeight);
  }

  // Resumo usado também pelo CertificateService
  async calculateSummary(enrollmentId) {
    const grades = await this.gradeModel.getGradesByEnrollmentId(enrollmentId);
    const totalWeight = this.#sumWeights(grades);

    return {
      grades,
      total_weight: totalWeight,
      average: this.calculateAverage(grades),
      is_complete: totalWeight === this.rules.TOTAL_GRADE_WEIGHT,
    };
  }

  // Aluno só vê as próprias notas; instrutor vê de qualquer matrícula
  async getSummary(requester, enrollmentId) {
    const enrollment = await this.enrollmentModel.getEnrollmentById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundError('Matrícula não encontrada.');
    }

    const isOwner = enrollment.users_id_fk === requester.id;
    const isInstructor = requester.role === USER_ROLES.INSTRUCTOR;
    if (!isOwner && !isInstructor) {
      throw new ForbiddenError('Você não tem permissão para ver as notas desta matrícula.');
    }

    return await this.calculateSummary(enrollmentId);
  }

  #sumWeights(grades) {
    return round2(grades.reduce((sum, g) => sum + g.weight, 0));
  }
}
