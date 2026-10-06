// Schemas para validar matrículas.
import { z } from 'zod';

// POST /enrollments
export const createEnrollmentSchema = z.object({
  classes_id_fk: z.number({ message: "O ID da turma é obrigatório." }).int().positive("ID da turma inválido.")
});

// PATCH /enrollments/:id/lock | /reactivate
export const idEnrollmentSchema = z.object({
  id: z.coerce.number().int().positive("O ID deve ser um número inteiro positivo")
});
