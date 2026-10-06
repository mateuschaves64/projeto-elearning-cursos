// Schemas para validar turmas.
import { z } from 'zod';

export const createClassSchema = z.object({
  courses_id_fk: z.number({ message: "O ID do curso é obrigatório." }).int().positive("ID do curso inválido."),
  name: z.string({ message: "O nome da turma é obrigatório." }).min(2, "O nome deve ter no mínimo 2 caracteres.").max(100),
  max_students: z.number({ message: "O limite de vagas é obrigatório." }).int().min(1, "A turma precisa ter pelo menos 1 vaga."),
  start_date: z.coerce.date({ message: "Data de início inválida." }),
  end_date: z.coerce.date({ message: "Data de término inválida." })
}).refine((data) => data.end_date > data.start_date, {
  message: "A data de término deve ser posterior à data de início.",
  path: ["end_date"]
});

export const idClassSchema = z.object({
  id: z.coerce.number().int().positive("O ID deve ser um número inteiro positivo")
});
