import { z } from 'zod';

import { RaffleStatus } from '@shared/enums/ruffle-status';

export const raffleIdParamsSchema = z.object({
  id: z.coerce
    .number({ error: `Parâmetro "id" deve ser um número inteiro positivo.` })
    .int({
      error: `Parâmetro "id" deve ser um número inteiro.`
    })
    .positive({ error: `Parâmetro "id" deve ser um número inteiro positivo.` })
});

export const userIdParamsSchema = z.object({
  userId: z.coerce
    .number({ error: `Parâmetro "userId" deve ser um número inteiro positivo.` })
    .int({
      error: `Parâmetro "userId" deve ser um número inteiro.`
    })
    .positive({ error: `Parâmetro "userId" deve ser um número inteiro positivo.` })
});

export const publicIdParamsSchema = z.object({
  publicId: z.string().min(1, `Parâmetro "publicId" é obrigatório.`)
});

const drawDateSchema = z
  .preprocess(
    arg => {
      if (typeof arg === 'string' || arg instanceof Date) {
        const date = new Date(arg);
        if (!isNaN(date.getTime())) {
          return date; // Retorna o objeto Date válido
        }
      }
      return undefined; // Retorna undefined para o Zod tratar como inválido/não preenchido
    },
    z.date({
      error: `Campo "drawDate" deve ser uma data válida.`
    })
  )
  .refine(
    date => {
      // Como o campo é .optional(), 'date' pode ser undefined aqui.
      // Garantimos que a data é futura apenas se ela foi fornecida.
      if (!date) return true;
      return date > new Date();
    },
    {
      message: `Campo "drawDate" deve ser uma data futura.`
    }
  )
  .optional();

export const createRaffleBodySchema = z.object({
  userId: z.number({ error: `Campo "userId" é obrigatório e deve ser um número.` }).int(),
  title: z
    .string({ error: `Campo "title" é obrigatório e deve ser uma string.` })
    .min(1, { error: `Campo "title" não pode ser vazio.` }),
  description: z.string({ error: `Campo "description" deve ser uma string.` }).optional(),
  imageUrl: z.url({ error: `Campo "imageUrl" deve ser uma URL válida.` }).optional(),
  startNumber: z
    .number({ error: `Campo "startNumber" é obrigatório e deve ser um número.` })
    .int({ error: `Campo "startNumber" deve ser um número inteiro.` })
    .min(0, { error: `Campo "startNumber" deve ser um número inteiro não negativo.` }),
  endNumber: z
    .number({ error: `Campo "endNumber" é obrigatório e deve ser um número.` })
    .int({ error: `Campo "endNumber" deve ser um número inteiro.` })
    .min(1, { error: `Campo "endNumber" deve ser um número inteiro positivo.` }),
  pricePerNumber: z
    .number({ error: `Campo "pricePerNumber" é obrigatório e deve ser um número.` })
    .positive({ error: `Campo "pricePerNumber" deve ser um número positivo.` }),
  drawDate: drawDateSchema
});

export const updateRaffleBodySchema = z.object({
  title: z.string().min(1, { error: `Campo "title" não pode ser vazio.` }).optional(),
  description: z.string({ error: `Campo "description" deve ser uma string.` }).optional(),
  imageUrl: z.url({ error: `Campo "imageUrl" deve ser uma URL válida.` }).optional(),
  status: z
    .enum(RaffleStatus, {
      error: `Campo "status" inválido. Valores aceitos: ${Object.values(RaffleStatus).join(', ')}.`
    })
    .optional(),
  drawDate: drawDateSchema
});

export const changeStatusBodySchema = z.object({
  status: z.enum(RaffleStatus, {
    error: `Campo "status" inválido. Valores aceitos: ${Object.values(RaffleStatus).join(', ')}.`
  })
});

export const findPaginatedBaseQuerySchema = z.object({
  page: z.coerce
    .number({
      error: `Campo "page" deve ser um número inteiro positivo.`
    })
    .int({
      error: `Campo "page" deve ser um número inteiro positivo.`
    })
    .positive({
      message: `Campo "page" deve ser um número inteiro positivo.`
    })
    .default(1),
  limit: z.coerce
    .number({
      error: `Campo "limit" deve ser um número inteiro positivo.`
    })
    .int({
      error: `Campo "limit" deve ser um número inteiro positivo.`
    })
    .positive({
      message: `Campo "limit" deve ser um número inteiro positivo.`
    })
    .default(12)
});

export const findPaginatedQuerySchema = z.object({
  ...findPaginatedBaseQuerySchema.shape,
  status: z.enum(RaffleStatus, {
    error: `Campo "status" inválido. Valores aceitos: ${Object.values(RaffleStatus).join(', ')}.`
  }),
  userId: userIdParamsSchema.shape.userId.optional()
});
