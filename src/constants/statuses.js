// Valores fixos usados no banco (colunas de status/role). Centralizados para evitar "strings mágicas".

export const USER_ROLES = Object.freeze({
  STUDENT: 'STUDENT',
  INSTRUCTOR: 'INSTRUCTOR',
});

export const CLASS_STATUS = Object.freeze({
  OPEN: 'OPEN',     // aceita matrículas e reativações
  CLOSED: 'CLOSED', // turma encerrada
});

export const ENROLLMENT_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',       // matrícula ocupa uma vaga
  LOCKED: 'LOCKED',       // trancada: libera a vaga
  COMPLETED: 'COMPLETED', // concluída (certificado emitido)
});
