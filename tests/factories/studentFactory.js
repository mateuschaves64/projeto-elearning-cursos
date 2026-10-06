/*Função para gerar dados de alunos/usuários fictícios.*/

export const criarEstudante = (sobrescrita = {}) => {

    const estudantePadrao = {
        id_users_pk: 1,
        name: "Aluno Teste",
        email: "aluno.teste@email.com",
        password: "senha_criptografada_hash",
        role: "STUDENT", // "STUDENT" | "INSTRUCTOR"
        created_at: new Date()
    };

    return {
        ...estudantePadrao,
        ...sobrescrita
    };
};