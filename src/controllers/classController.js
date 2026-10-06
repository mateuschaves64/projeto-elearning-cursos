import { classService } from '../container.js';
import { handleError } from '../utils/handleError.js';

// 1. Listar turmas (Público)
export const getClasses = async (req, res) => {
  try {
    const classes = await classService.listClasses();
    return res.status(200).json(classes);
  } catch (error) {
    return handleError(res, error, 'Erro interno ao listar turmas.');
  }
};

// 2. Buscar turma por ID (Público)
export const getClassById = async (req, res) => {
  try {
    const turma = await classService.getClassById(Number(req.params.id));
    return res.status(200).json(turma);
  } catch (error) {
    return handleError(res, error, 'Erro interno ao buscar turma.');
  }
};

// 3. Consultar vagas da turma (Público)
export const getClassAvailability = async (req, res) => {
  try {
    const availability = await classService.getAvailability(Number(req.params.id));
    return res.status(200).json(availability);
  } catch (error) {
    return handleError(res, error, 'Erro interno ao consultar vagas.');
  }
};

// 4. Criar turma (Protegido por JWT + INSTRUCTOR)
export const createClass = async (req, res) => {
  try {
    const turma = await classService.createClass(req.body);
    return res.status(201).json(turma);
  } catch (error) {
    return handleError(res, error, 'Erro interno ao criar turma.');
  }
};

// 5. Encerrar turma (Protegido por JWT + INSTRUCTOR)
export const closeClass = async (req, res) => {
  try {
    const turma = await classService.closeClass(Number(req.params.id));
    return res.status(200).json({ message: 'Turma encerrada com sucesso.', data: turma });
  } catch (error) {
    return handleError(res, error, 'Erro interno ao encerrar turma.');
  }
};
