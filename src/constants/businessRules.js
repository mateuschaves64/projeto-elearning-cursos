// Regras de negócio configuráveis. Os services recebem este objeto por injeção,
// então nos testes dá para sobrescrever qualquer valor.

export const BUSINESS_RULES = Object.freeze({
  // Certificado
  MIN_AVERAGE_FOR_CERTIFICATE: 7,   // média mínima (0 a 10)
  TOTAL_GRADE_WEIGHT: 100,          // soma dos pesos exigida para emitir o certificado

  // Notas
  MIN_GRADE: 0,
  MAX_GRADE: 10,

  // Trancamento
  MAX_LOCKED_ENROLLMENTS_PER_USER: 2, // máx. de matrículas trancadas ao mesmo tempo
  LOCK_DEADLINE_PERCENT: 50,          // só pode trancar até 50% da duração da turma
});
