// Erros de domínio. Os services lançam estes erros e o controller converte em status HTTP
// (ver src/utils/handleError.js). Assim a regra de negócio não depende de req/res.

export class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado.', details = null) {
    super(message, 404, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Não autorizado.', details = null) {
    super(message, 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado.', details = null) {
    super(message, 403, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflito de dados.', details = null) {
    super(message, 409, details);
  }
}

// Violação de regra de negócio (ex.: pré-requisito não cumprido, média insuficiente)
export class BusinessRuleError extends AppError {
  constructor(message = 'Regra de negócio violada.', details = null) {
    super(message, 422, details);
  }
}
