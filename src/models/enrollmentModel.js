// Lógica de banco para Matrículas.

import prisma from '../../db.js';

// Matrícula + turma + curso (usado para checar pré-requisitos e prazos)
const includeClassAndCourse = {
  classes: { include: { courses: true } }
};

// 1. Buscar uma matrícula (com turma, curso e dados do aluno)
export const getEnrollmentById = async (id) => {
  return await prisma.enrollments.findUnique({
    where: { id_enrollments_pk: Number(id) },
    include: {
      ...includeClassAndCourse,
      users: { select: { id_users_pk: true, name: true, email: true } }
    }
  });
};

// 2. Todas as matrículas de um aluno
export const getEnrollmentsByUser = async (userId) => {
  return await prisma.enrollments.findMany({
    where: { users_id_fk: Number(userId) },
    include: includeClassAndCourse,
    orderBy: { created_at: 'desc' }
  });
};

// 3. Contar matrículas de uma turma por status (ex.: quantas ACTIVE = vagas ocupadas)
export const countEnrollmentsByClassAndStatus = async (classId, status) => {
  return await prisma.enrollments.count({
    where: { classes_id_fk: Number(classId), status }
  });
};

// 4. Contar matrículas de um aluno por status (ex.: quantas LOCKED)
export const countEnrollmentsByUserAndStatus = async (userId, status) => {
  return await prisma.enrollments.count({
    where: { users_id_fk: Number(userId), status }
  });
};

// 5. Criar matrícula (status ACTIVE por padrão no banco)
export const createEnrollment = async ({ users_id_fk, classes_id_fk }) => {
  return await prisma.enrollments.create({
    data: { users_id_fk, classes_id_fk }
  });
};

// 6. Atualizar matrícula (status, locked_at, final_grade)
export const updateEnrollment = async (id, data) => {
  return await prisma.enrollments.update({
    where: { id_enrollments_pk: Number(id) },
    data
  });
};
