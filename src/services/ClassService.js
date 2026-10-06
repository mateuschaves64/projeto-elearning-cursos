// Regras de Turmas (criação, encerramento e consulta de vagas).

import { CLASS_STATUS, ENROLLMENT_STATUS } from '../constants/statuses.js';
import { BusinessRuleError, ConflictError, NotFoundError } from '../errors/AppError.js';

export class ClassService {
  constructor({ classModel, courseModel, enrollmentModel }) {
    this.classModel = classModel;
    this.courseModel = courseModel;
    this.enrollmentModel = enrollmentModel;
  }

  async createClass({ courses_id_fk, name, max_students, start_date, end_date }) {
    const course = await this.courseModel.getCourseById(courses_id_fk);
    if (!course) {
      throw new NotFoundError('Curso não encontrado.');
    }

    if (!Number.isInteger(max_students) || max_students < 1) {
      throw new BusinessRuleError('A turma precisa ter pelo menos 1 vaga.');
    }

    if (new Date(end_date) <= new Date(start_date)) {
      throw new BusinessRuleError('A data de término deve ser posterior à data de início.');
    }

    return await this.classModel.createClass({
      courses_id_fk,
      name,
      max_students,
      start_date,
      end_date,
      status: CLASS_STATUS.OPEN,
    });
  }

  async listClasses() {
    return await this.classModel.getAllClasses();
  }

  async getClassById(classId) {
    const turma = await this.classModel.getClassById(classId);
    if (!turma) {
      throw new NotFoundError('Turma não encontrada.');
    }
    return turma;
  }

  // Vagas = max_students - matrículas ACTIVE (matrícula trancada libera a vaga)
  async getAvailability(classId) {
    const turma = await this.getClassById(classId);

    const activeEnrollments = await this.enrollmentModel.countEnrollmentsByClassAndStatus(
      classId,
      ENROLLMENT_STATUS.ACTIVE
    );

    return {
      class_id: turma.id_classes_pk,
      status: turma.status,
      max_students: turma.max_students,
      active_enrollments: activeEnrollments,
      available_seats: Math.max(0, turma.max_students - activeEnrollments),
    };
  }

  async closeClass(classId) {
    const turma = await this.getClassById(classId);

    if (turma.status === CLASS_STATUS.CLOSED) {
      throw new ConflictError('A turma já está encerrada.');
    }

    return await this.classModel.updateClass(classId, { status: CLASS_STATUS.CLOSED });
  }
}
