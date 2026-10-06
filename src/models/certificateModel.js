// Lógica de banco para Certificados.

import prisma from '../../db.js';
import { ENROLLMENT_STATUS } from '../constants/statuses.js';

export const getCertificateByEnrollmentId = async (enrollmentId) => {
  return await prisma.certificates.findUnique({
    where: { enrollments_id_fk: Number(enrollmentId) }
  });
};

// Cria o certificado E conclui a matrícula na mesma transação:
// ou os dois acontecem, ou nenhum.
export const createCertificateAndCompleteEnrollment = async ({ enrollments_id_fk, code, average }) => {
  const [certificate] = await prisma.$transaction([
    prisma.certificates.create({
      data: { enrollments_id_fk, code, average }
    }),
    prisma.enrollments.update({
      where: { id_enrollments_pk: enrollments_id_fk },
      data: { status: ENROLLMENT_STATUS.COMPLETED, final_grade: average }
    })
  ]);

  return certificate;
};

export const getCertificatesByUserId = async (userId) => {
  return await prisma.certificates.findMany({
    where: { enrollments: { users_id_fk: Number(userId) } },
    include: {
      enrollments: { include: { classes: { include: { courses: true } } } }
    },
    orderBy: { issued_at: 'desc' }
  });
};
