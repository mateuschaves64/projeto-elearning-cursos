// Lógica de banco para Notas.

import prisma from '../../db.js';

export const createGrade = async ({ enrollments_id_fk, title, value, weight }) => {
  return await prisma.grades.create({
    data: { enrollments_id_fk, title, value, weight }
  });
};

export const getGradesByEnrollmentId = async (enrollmentId) => {
  return await prisma.grades.findMany({
    where: { enrollments_id_fk: Number(enrollmentId) },
    orderBy: { created_at: 'asc' }
  });
};
