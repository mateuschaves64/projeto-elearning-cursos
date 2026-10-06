import { courseService } from '../container.js';
import { handleError } from '../utils/handleError.js';

// 1. Listar cursos (Público)
export const getCourses = async (req, res) => {
  try {
    const courses = await courseService.listCourses();
    return res.status(200).json(courses);
  } catch (error) {
    return handleError(res, error, 'Erro interno ao listar cursos.');
  }
};

// 2. Buscar curso por ID (Público)
export const getCourseById = async (req, res) => {
  try {
    const course = await courseService.getCourseById(Number(req.params.id));
    return res.status(200).json(course);
  } catch (error) {
    return handleError(res, error, 'Erro interno ao buscar curso.');
  }
};

// 3. Criar curso (Protegido por JWT + INSTRUCTOR)
export const createCourse = async (req, res) => {
  try {
    const course = await courseService.createCourse(req.body);
    return res.status(201).json(course);
  } catch (error) {
    return handleError(res, error, 'Erro interno ao criar curso.');
  }
};

// 4. Atualizar curso (Protegido por JWT + INSTRUCTOR)
export const updateCourse = async (req, res) => {
  try {
    const course = await courseService.updateCourse(Number(req.params.id), req.body);
    return res.status(200).json(course);
  } catch (error) {
    return handleError(res, error, 'Erro interno ao atualizar curso.');
  }
};

// 5. Listar pré-requisitos de um curso (Público)
export const getPrerequisites = async (req, res) => {
  try {
    const prerequisites = await courseService.listPrerequisites(Number(req.params.id));
    return res.status(200).json(prerequisites);
  } catch (error) {
    return handleError(res, error, 'Erro interno ao listar pré-requisitos.');
  }
};

// 6. Adicionar pré-requisito (Protegido por JWT + INSTRUCTOR)
export const addPrerequisite = async (req, res) => {
  try {
    const link = await courseService.addPrerequisite(
      Number(req.params.id),
      req.body.required_courses_id_fk
    );
    return res.status(201).json(link);
  } catch (error) {
    return handleError(res, error, 'Erro interno ao adicionar pré-requisito.');
  }
};

// 7. Remover pré-requisito (Protegido por JWT + INSTRUCTOR)
export const removePrerequisite = async (req, res) => {
  try {
    await courseService.removePrerequisite(Number(req.params.id), Number(req.params.requiredId));
    return res.status(200).json({ message: 'Pré-requisito removido com sucesso.' });
  } catch (error) {
    return handleError(res, error, 'Erro interno ao remover pré-requisito.');
  }
};
