import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { CourseService } from '../../src/services/CourseService.js';
import { BusinessRuleError, ConflictError, NotFoundError } from '../../src/errors/AppError.js';

describe('CourseService', () => {
  let courseService;
  let mockCourseModel;

  beforeEach(() => {
    // Criação dos mocks do repositório
    mockCourseModel = {
      getCourseByTitle: jest.fn(),
      createCourse: jest.fn(),
      getAllCourses: jest.fn(),
      getCourseById: jest.fn(),
      updateCourse: jest.fn(),
      getPrerequisitesByCourseId: jest.fn(),
      getPrerequisiteLink: jest.fn(),
      getAllPrerequisiteLinks: jest.fn(),
      addPrerequisite: jest.fn(),
      removePrerequisite: jest.fn(),
    };

    courseService = new CourseService({ courseModel: mockCourseModel });
  });

  describe('createCourse', () => {
    it('deve criar um curso com sucesso', async () => {
      const courseData = { title: 'Node.js', description: 'Curso de Node', workload_hours: 40 };
      mockCourseModel.getCourseByTitle.mockResolvedValue(null);
      mockCourseModel.createCourse.mockResolvedValue({ id_courses_pk: 1, ...courseData });

      const result = await courseService.createCourse(courseData);

      expect(mockCourseModel.getCourseByTitle).toHaveBeenCalledWith('Node.js');
      expect(mockCourseModel.createCourse).toHaveBeenCalledWith(courseData);
      expect(result).toHaveProperty('id_courses_pk', 1);
    });

    it('deve lançar ConflictError se já existir um curso com o mesmo título', async () => {
      mockCourseModel.getCourseByTitle.mockResolvedValue({ id_courses_pk: 1, title: 'Node.js' });
      await expect(
        courseService.createCourse({ title: 'Node.js', description: 'Desc', workload_hours: 40 })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('getCourseById', () => {
    it('deve retornar o curso se encontrado', async () => {
      const course = { id_courses_pk: 1, title: 'Node.js' };
      mockCourseModel.getCourseById.mockResolvedValue(course);

      const result = await courseService.getCourseById(1);

      expect(result).toEqual(course);
    });

    it('deve lançar NotFoundError se o curso não for encontrado', async () => {
      mockCourseModel.getCourseById.mockResolvedValue(null);

      await expect(courseService.getCourseById(99)).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateCourse', () => {
    it('deve atualizar o curso com sucesso', async () => {
      const courseId = 1;
      const updateData = { title: 'Novo Título' };

      mockCourseModel.getCourseById.mockResolvedValue({ id_courses_pk: courseId, title: 'Título Antigo' });
      mockCourseModel.getCourseByTitle.mockResolvedValue(null);
      mockCourseModel.updateCourse.mockResolvedValue({ id_courses_pk: courseId, ...updateData });

      const result = await courseService.updateCourse(courseId, updateData);

      expect(result.title).toBe('Novo Título');
    });

    it('deve lançar ConflictError se o novo título já estiver em uso por outro curso', async () => {
      const courseId = 1;
      const updateData = { title: 'O título já existe' };

      mockCourseModel.getCourseById.mockResolvedValue({ id_courses_pk: courseId, title: 'Título Antigo' });
      mockCourseModel.getCourseByTitle.mockResolvedValue({ id_courses_pk: 2, title: 'Título Existente' });

      await expect(courseService.updateCourse(courseId, updateData)).rejects.toThrow(ConflictError);
    });

    it('deve permitir atualizar mantendo o mesmo título do próprio curso', async () => {
      const courseId = 1;
      const updateData = { title: 'Mesmo Título' };

      mockCourseModel.getCourseById.mockResolvedValue({ id_courses_pk: courseId, title: 'Mesmo Título' });
      mockCourseModel.getCourseByTitle.mockResolvedValue({ id_courses_pk: courseId, title: 'Mesmo Título' });
      mockCourseModel.updateCourse.mockResolvedValue({ id_courses_pk: courseId, title: 'Mesmo Título' });

      await expect(courseService.updateCourse(courseId, updateData)).resolves.not.toThrow();
    });
  });

  describe('addPrerequisite', () => {
    it('deve lançar BusinessRuleError se o curso tentar ser pré-requisito dele mesmo', async () => {
      await expect(courseService.addPrerequisite(1, 1)).rejects.toThrow(BusinessRuleError);
    });

    it('deve lançar NotFoundError se o curso principal não existir', async () => {
      mockCourseModel.getCourseById.mockResolvedValueOnce(null);

      await expect(courseService.addPrerequisite(1, 2)).rejects.toThrow(NotFoundError);
    });

    it('deve lançar NotFoundError se o curso pré-requisito não existir', async () => {
      mockCourseModel.getCourseById
        .mockResolvedValueOnce({ id_courses_pk: 1 }) // Curso principal existe
        .mockResolvedValueOnce(null);                  // Pré-requisito não existe

      await expect(courseService.addPrerequisite(1, 2)).rejects.toThrow(NotFoundError);
    });

    it('deve lançar ConflictError se o pré-requisito já estiver vinculado', async () => {
      mockCourseModel.getCourseById.mockResolvedValue({ id_courses_pk: 1 });
      mockCourseModel.getPrerequisiteLink.mockResolvedValue({ courses_id_fk: 1, required_courses_id_fk: 2 });

      await expect(courseService.addPrerequisite(1, 2)).rejects.toThrow(ConflictError);
    });

    it('deve lançar BusinessRuleError se houver dependência circular direta ou indireta', async () => {
      // Cenário de ciclo: B exige A 
      // Se tentarmos fazer A exigir B, deve gerar ciclo
      mockCourseModel.getCourseById.mockResolvedValue({ id_courses_pk: 1 });
      mockCourseModel.getPrerequisiteLink.mockResolvedValue(null);
      mockCourseModel.getAllPrerequisiteLinks.mockResolvedValue([
        { courses_id_fk: 2, required_courses_id_fk: 1 }, // 2 exige 1
      ]);

      await expect(courseService.addPrerequisite(1, 2)).rejects.toThrow(BusinessRuleError);
    });

    it('deve adicionar o pré-requisito com sucesso quando válido', async () => {
      mockCourseModel.getCourseById.mockResolvedValue({ id_courses_pk: 1 });
      mockCourseModel.getPrerequisiteLink.mockResolvedValue(null);
      mockCourseModel.getAllPrerequisiteLinks.mockResolvedValue([]);
      mockCourseModel.addPrerequisite.mockResolvedValue({ courses_id_fk: 1, required_courses_id_fk: 2 });

      const result = await courseService.addPrerequisite(1, 2);

      expect(mockCourseModel.addPrerequisite).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual({ courses_id_fk: 1, required_courses_id_fk: 2 });
    });
  });

  describe('removePrerequisite', () => {
    it('deve remover o pré-requisito com sucesso', async () => {
      mockCourseModel.getPrerequisiteLink.mockResolvedValue({ courses_id_fk: 1, required_courses_id_fk: 2 });

      await courseService.removePrerequisite(1, 2);

      expect(mockCourseModel.removePrerequisite).toHaveBeenCalledWith(1, 2);
    });

    it('deve lançar NotFoundError se o vínculo não existir', async () => {
      mockCourseModel.getPrerequisiteLink.mockResolvedValue(null);

      await expect(courseService.removePrerequisite(1, 2)).rejects.toThrow(NotFoundError);
    });
  });
});
