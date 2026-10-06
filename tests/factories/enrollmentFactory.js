/*Função para gerar matrículas e turmas fictícias.*/

export const criarEnrollment = (sobrescrita = {}) => {

  const enrollmentPadrao = {
    id_enrollments_pk: 699,
    status: "ACTIVE", // Status: "ACTIVE" | "LOCKED" | "COMPLETED"
    locked_at: null,
    final_grade: null,
    users_id_fk: 1,      // FK para id_users_pk
    classes_id_fk: 10,   // FK para id_classes_pk
    created_at: new Date()
  };

  return {
    ...enrollmentPadrao,
    ...sobrescrita
  };
};


export const criarTurma = (sobrescrita = {}) => {

  const turmaPadrao = {
    id_classes_pk: 10,
    name: "Turma 2026.1",
    max_students: 30, // Limite de vagas
    status: "OPEN",   // "OPEN" | "CLOSED"
    start_date: new Date(),
    end_date: new Date( // Transformo esse número de milisegundos em um objeto JS 
        Date.now() // Pego a hora exata e a data
         + 1000 * // Pego 1 segundo e multiplico por 60
         60 * // Esse 60 são 60 segundos
         60 * // 60 Segundos vezes 60 minutos da 1 hora
         24 * // 1 hora vezes 24 dá 1 dia
         90), // Pegamos um dia e transformamos em 3 meses, ou seja, 90 dias
    courses_id_fk: 100,
    created_at: new Date()
  };

  return {
    ...turmaPadrao,
    ...sobrescrita
  };
};  