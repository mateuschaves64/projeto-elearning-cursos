// Schemas para validar o corpo (body) das requisições de login e registro.
import { z } from 'zod';
import { USER_ROLES } from '../constants/statuses.js';

export const registerSchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
  email: z.email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  // Simplificação acadêmica: qualquer um escolhe o papel ao se cadastrar (em produção, não faça isso)
  role: z.enum(Object.values(USER_ROLES), "Papel inválido").optional()
});

export const loginSchema = z.object({
  email: z.email("O e-mail é obrigatório"),
  password: z.string().min(1, "A senha é obrigatória")
});
