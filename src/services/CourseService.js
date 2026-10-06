// Regras de Cursos/Disciplinas e dos seus PRÉ-REQUISITOS.
//
// Regras:
//  - Título de curso é único.
//  - Um curso não pode ser pré-requisito de si mesmo.
//  - Não pode haver pré-requisito duplicado.
//  - Não pode haver pré-requisito CIRCULAR (A exige B, B exige C, C exige A).

import { BusinessRuleError, ConflictError, NotFoundError } from '../errors/AppError.js';

export class CourseService {
  constructor({ courseModel }) {
    this.courseModel = courseModel;
  }

  async createCourse({ title, description, workload_hours }) {
    const existing = await this.courseModel.getCourseByTitle(title);
    if (existing) {
      throw new ConflictError('Já existe um curso com este título.');
    }

    return await this.courseModel.createCourse({ title, description, workload_hours });
  }

  async listCourses() {
    return await this.courseModel.getAllCourses();
  }

  async getCourseById(courseId) {
    const course = await this.courseModel.getCourseById(courseId);
    if (!course) {
      throw new NotFoundError('Curso não encontrado.');
    }
    return course;
  }

  async updateCourse(courseId, data) {
    await this.getCourseById(courseId); // lança 404 se não existir

    if (data.title) {
      const sameTitle = await this.courseModel.getCourseByTitle(data.title);
      if (sameTitle && sameTitle.id_courses_pk !== courseId) {
        throw new ConflictError('Já existe um curso com este título.');
      }
    }

    return await this.courseModel.updateCourse(courseId, data);
  }

  // ---------- Pré-requisitos ----------

  async listPrerequisites(courseId) {
    await this.getCourseById(courseId);
    return await this.courseModel.getPrerequisitesByCourseId(courseId);
  }

  // "courseId" passa a EXIGIR "requiredCourseId"
  async addPrerequisite(courseId, requiredCourseId) {
    if (courseId === requiredCourseId) {
      throw new BusinessRuleError('Um curso não pode ser pré-requisito de si mesmo.');
    }

    const course = await this.courseModel.getCourseById(courseId);
    if (!course) {
      throw new NotFoundError('Curso não encontrado.');
    }

    const requiredCourse = await this.courseModel.getCourseById(requiredCourseId);
    if (!requiredCourse) {
      throw new NotFoundError('Curso exigido (pré-requisito) não encontrado.');
    }

    const existingLink = await this.courseModel.getPrerequisiteLink(courseId, requiredCourseId);
    if (existingLink) {
      throw new ConflictError('Este pré-requisito já foi cadastrado para o curso.');
    }

    const links = await this.courseModel.getAllPrerequisiteLinks();
    if (this.#createsCycle(links, courseId, requiredCourseId)) {
      throw new BusinessRuleError(
        'Pré-requisito circular: o curso exigido já depende (direta ou indiretamente) deste curso.'
      );
    }

    return await this.courseModel.addPrerequisite(courseId, requiredCourseId);
  }

  async removePrerequisite(courseId, requiredCourseId) {
    const existingLink = await this.courseModel.getPrerequisiteLink(courseId, requiredCourseId);
    if (!existingLink) {
      throw new NotFoundError('Pré-requisito não encontrado para este curso.');
    }

    await this.courseModel.removePrerequisite(courseId, requiredCourseId);
  }

  // Adicionar "courseId -> requiredCourseId" cria ciclo se, partindo de requiredCourseId
  // e seguindo as exigências já existentes, for possível chegar em courseId (busca em profundidade).
  #createsCycle(links, courseId, requiredCourseId) {
    const requirementsOf = new Map(); // curso -> cursos que ele exige
    for (const link of links) {
      if (!requirementsOf.has(link.courses_id_fk)) {
        requirementsOf.set(link.courses_id_fk, []);
      }
      requirementsOf.get(link.courses_id_fk).push(link.required_courses_id_fk);
    }

    const visited = new Set();
    const stack = [requiredCourseId];

    while (stack.length > 0) {
      const current = stack.pop();
      if (current === courseId) return true;
      if (visited.has(current)) continue;

      visited.add(current);
      stack.push(...(requirementsOf.get(current) ?? []));
    }

    return false;
  }
}
