import { z } from 'zod';

import { RaffleStatus } from '@shared/enums/ruffle-status';

export const createRaffleBodySchema = z.object({
  userId: z.number({ error: `Campo 'userId' é obrigatório e deve ser um número.` }).int(),
  title: z
    .string({ error: `Campo 'title' é obrigatório e deve ser uma string.` })
    .min(1, `Campo 'title' não pode ser vazio.`),
  description: z.string().optional(),
  imageUrl: z.url(`Campo 'imageUrl' deve ser uma URL válida.`).optional(),
  startNumber: z
    .number({ error: `Campo 'startNumber' é obrigatório e deve ser um número.` })
    .int()
    .min(0),
  endNumber: z
    .number({ error: `Campo 'endNumber' é obrigatório e deve ser um número.` })
    .int()
    .min(1),
  pricePerNumber: z
    .number({ error: `Campo 'pricePerNumber' é obrigatório e deve ser um número.` })
    .positive()
});

export const updateRaffleBodySchema = z.object({
  title: z.string().min(1, `Campo 'title' não pode ser vazio.`).optional(),
  description: z.string().optional(),
  imageUrl: z.url(`Campo 'imageUrl' deve ser uma URL válida.`).optional()
});

export const changeStatusBodySchema = z.object({
  status: z.enum(RaffleStatus, {
    error: `Campo 'status' inválido. Valores aceitos: ${Object.values(RaffleStatus).join(', ')}.`
  })
});

export const raffleIdParamsSchema = z.object({
  id: z.coerce
    .number({ error: `Parâmetro 'id' deve ser um número inteiro positivo.` })
    .int()
    .positive()
});

export const publicIdParamsSchema = z.object({
  publicId: z.string().min(1, `Parâmetro 'publicId' é obrigatório.`)
});

export const findPaginatedQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  status: z.enum(RaffleStatus).optional(),
  userId: z.coerce.number().int().positive().optional()
});

export const userIdParamsSchema = z.object({
  userId: z.coerce
    .number({ error: `Parâmetro 'userId' deve ser um número inteiro positivo.` })
    .int()
    .positive()
});
