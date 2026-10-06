// Lógica de banco de dados para Usuários (buscar por e-mail para login, buscar por ID, criar novo usuário).

import prisma from '../../db.js';

export const findUserByEmail = async (email) => {
  return await prisma.users.findUnique({
    where: { email }
  });
};

// Sem o campo password: usado para dados de contato (ex.: enviar e-mail)
export const findUserById = async (id) => {
  return await prisma.users.findUnique({
    where: { id_users_pk: Number(id) },
    select: {
      id_users_pk: true,
      name: true,
      email: true,
      role: true
    }
  });
};

export const createUser = async (userData) => {
  return await prisma.users.create({
    data: userData,
    select: {
      id_users_pk: true,
      name: true,
      email: true,
      role: true,
      created_at: true
    }
  });
};
