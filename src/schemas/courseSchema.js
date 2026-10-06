// Schemas para validar cursos e pré-requisitos.
import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string({ message: "O título é obrigatório." })
    .min(3, "O título deve ter no mínimo 3 caracteres.")
    .max(150, "O título deve ter no máximo 150 caracteres."),
  description: z.string({ message: "A descrição é obrigatória." }).min(1, "A descrição é obrigatória."),
  workload_hours: z.number({ message: "A carga horária é obrigatória." })
    .int("A carga horária deve ser um número inteiro.")
    .positive("A carga horária deve ser maior que zero.")
});

export const updateCourseSchema = createCourseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Envie ao menos um campo para atualizar." }
);

// Validação do ID via URL (GET /courses/:id)
export const idCourseSchema = z.object({
  id: z.coerce.number().int().positive("O ID deve ser um número inteiro positivo")
});

// POST /courses/:id/prerequisites
export const addPrerequisiteSchema = z.object({
  required_courses_id_fk: z.number({ message: "O ID do curso exigido é obrigatório." })
    .int()
    .positive("ID do curso exigido inválido.")
});

// DELETE /courses/:id/prerequisites/:requiredId
export const prerequisiteParamsSchema = z.object({
  id: z.coerce.number().int().positive("O ID deve ser um número inteiro positivo"),
  requiredId: z.coerce.number().int().positive("O ID do pré-requisito deve ser um número inteiro positivo")
});
