// Schemas para validar certificados.
import { z } from 'zod';

// POST /certificates
export const issueCertificateSchema = z.object({
  enrollments_id_fk: z.number({ message: "O ID da matrícula é obrigatório." }).int().positive("ID da matrícula inválido.")
});
