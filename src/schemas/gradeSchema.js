// Schemas para validar notas.
import { z } from 'zod';

// POST /grades
export const launchGradeSchema = z.object({
  enrollments_id_fk: z.number({ message: "O ID da matrícula é obrigatório." }).int().positive("ID da matrícula inválido."),
  title: z.string({ message: "O título da avaliação é obrigatório." }).trim().min(1, "O título da avaliação é obrigatório.").max(100),
  value: z.number({ message: "A nota é obrigatória." }).min(0, "A nota mínima é 0.").max(10, "A nota máxima é 10."),
  weight: z.number({ message: "O peso é obrigatório." }).positive("O peso deve ser maior que zero.").max(100, "O peso máximo é 100.")
});

// GET /grades/enrollment/:enrollmentId
export const enrollmentIdParamSchema = z.object({
  enrollmentId: z.coerce.number().int().positive("O ID da matrícula deve ser um número inteiro positivo")
});
