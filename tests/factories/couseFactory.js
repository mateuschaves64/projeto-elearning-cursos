/*Função para gerar dados de cursos fictícios (ex: id, nome, pré-requisitos)*/

export const criarCurso = (sobrescrita = {}) => {

    const cursoPadrao = {
        id_courses_pk: 100,
        title: 'Curso de Node.js Avançado',
        description: 'Aprenda testes unitários e arquitetura de software',
        workload_hours: 40,
        created_at: new Date(),
        prerequisites: [] // Relações de pré-requisitos
    };

    return {
        ...cursoPadrao,
        ...sobrescrita
    };
};