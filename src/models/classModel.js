// Lógica de banco para Turmas (listar, buscar por ID, criar, atualizar status).

import prisma from '../../db.js';

export const getAllClasses = async () => {
  return await prisma.classes.findMany({
    include: { courses: true },
    orderBy: { start_date: 'asc' }
  });
};

export const getClassById = async (id) => {
  return await prisma.classes.findUnique({
    where: { id_classes_pk: Number(id) },
    include: { courses: true }
  });
};

export const createClass = async (data) => {
  return await prisma.classes.create({ data });
};

export const updateClass = async (id, data) => {
  return await prisma.classes.update({
    where: { id_classes_pk: Number(id) },
    data
  });
};
