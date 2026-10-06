import { enrollmentService } from '../container.js';
import { handleError } from '../utils/handleError.js';

// O id do usuário vem do token JWT decodificado pelo middleware de autenticação (req.user.id)

// 1. Matricular-se em uma turma (POST /enrollments)
export const createEnrollment = async (req, res) => {
  try {
    const enrollment = await enrollmentService.enroll(req.user.id, req.body.classes_id_fk);
    return res.status(201).json({ message: 'Matrícula realizada com sucesso!', data: enrollment });
  } catch (error) {
    return handleError(res, error, 'Erro interno ao realizar matrícula.');
  }
};

// 2. Listar minhas matrículas (GET /enrollments/me)
export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await enrollmentService.listUserEnrollments(req.user.id);
    return res.status(200).json(enrollments);
  } catch (error) {
    return handleError(res, error, 'Erro interno ao listar matrículas.');
  }
};

// 3. Trancar matrícula (PATCH /enrollments/:id/lock)
export const lockEnrollment = async (req, res) => {
  try {
    const enrollment = await enrollmentService.lockEnrollment(req.user.id, Number(req.params.id));
    return res.status(200).json({ message: 'Matrícula trancada com sucesso.', data: enrollment });
  } catch (error) {
    return handleError(res, error, 'Erro interno ao trancar matrícula.');
  }
};

// 4. Reativar matrícula trancada (PATCH /enrollments/:id/reactivate)
export const reactivateEnrollment = async (req, res) => {
  try {
    const enrollment = await enrollmentService.reactivateEnrollment(req.user.id, Number(req.params.id));
    return res.status(200).json({ message: 'Matrícula reativada com sucesso.', data: enrollment });
  } catch (error) {
    return handleError(res, error, 'Erro interno ao reativar matrícula.');
  }
};
