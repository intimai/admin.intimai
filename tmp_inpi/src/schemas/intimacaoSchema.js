import { z } from 'zod';

export const intimacaoSchema = z.object({
  nome_completo: z.string().min(1, { message: "O nome é obrigatório." }),
  documento: z.string().optional(),
  telefone: z.preprocess(
    (val) => String(val).replace(/\D/g, ''),
    z.string()
      .min(1, { message: "O telefone é obrigatório." })
      .regex(/^\d{10,11}$/, { message: "O número de telefone deve ter 10 ou 11 dígitos." })
  ),
  tipo_procedimento: z.string().min(1, { message: "O tipo de procedimento é obrigatório." }),
  numero_procedimento: z.string().min(1, { message: "O número do procedimento é obrigatório." }),
  data: z.any().refine(val => val, { message: "A data é obrigatória." }),
  periodo: z.string().min(1, { message: "O período é obrigatório." }),
});