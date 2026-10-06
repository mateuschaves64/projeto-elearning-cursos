import { gradeService } from '../container.js';
import { handleError } from '../utils/handleError.js';

// 1. Lançar nota (POST /grades) - Protegido por JWT + INSTRUCTOR
export const launchGrade = async (req, res) => {
  try {
    const grade = await gradeService.launchGrade(req.body);
    return res.status(201).json({ message: 'Nota lançada com sucesso!', data: grade });
  } catch (error) {
    return handleError(res, error, 'Erro interno ao lançar nota.');
  }
};

// 2. Ver notas e média de uma matrícula (GET /grades/enrollment/:enrollmentId)
//    Aluno vê só as suas; instrutor vê qualquer uma
export const getEnrollmentGrades = async (req, res) => {
  try {
    const summary = await gradeService.getSummary(req.user, Number(req.params.enrollmentId));
    return res.status(200).json(summary);
  } catch (error) {
    return handleError(res, error, 'Erro interno ao buscar notas.');
  }
};
