import { AppError } from '../errors/AppError.js';

// Padroniza o catch dos controllers: erros de domínio viram o status correto,
// qualquer outro erro vira 500.
export const handleError = (res, error, fallbackMessage = 'Erro interno no servidor.') => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      ...(error.details && { details: error.details }),
    });
  }

  return res.status(500).json({ message: fallbackMessage, error: error.message });
};
