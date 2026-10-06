// Dependência EXTERNA (e-mail). Aqui é uma simulação com console.log.
// Em produção, troque o corpo da função por nodemailer, SendGrid, etc.
// Os services recebem este módulo por injeção, então nos testes ele vira um mock com jest.fn().

export const sendEmail = async ({ to, subject, body }) => {
  console.log(`[EMAIL] Para: ${to} | Assunto: ${subject}\n${body}`);
  return { delivered: true };
};
