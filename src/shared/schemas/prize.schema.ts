import { z } from 'zod';

import { AppConstants } from '@shared/constants';

export const prizeIdParamsSchema = z.object({
  id: z.coerce
    .number({ error: `Parâmetro "id" deve ser um número inteiro positivo.` })
    .int({ error: `Parâmetro "id" deve ser um número inteiro.` })
    .positive({ error: `Parâmetro "id" deve ser um número inteiro positivo.` })
});

export const raffleIdParamsSchema = z.object({
  raffleId: z.coerce
    .number({ error: `Parâmetro "raffleId" deve ser um número inteiro positivo.` })
    .int({ error: `Parâmetro "raffleId" deve ser um número inteiro.` })
    .positive({ error: `Parâmetro "raffleId" deve ser um número inteiro positivo.` })
});

export const createPrizeBodySchema = z.object({
  raffleId: z
    .number({ error: `Campo "raffleId" é obrigatório e deve ser um número.` })
    .int()
    .positive(),
  title: z
    .string({ error: `Campo "title" é obrigatório e deve ser uma string.` })
    .min(AppConstants.ONE, { error: `Campo "title" não pode ser vazio.` }),
  description: z.string({ error: `Campo "description" deve ser uma string.` }).optional(),
  imageUrl: z.url({ error: `Campo "imageUrl" deve ser uma URL válida.` }).optional(),
  prizeOrder: z
    .number({ error: `Campo "prizeOrder" deve ser um número inteiro positivo.` })
    .int({ error: `Campo "prizeOrder" deve ser um número inteiro.` })
    .positive({ error: `Campo "prizeOrder" deve ser um número inteiro positivo.` })
    .optional(),
  value: z
    .number({ error: `Campo "value" deve ser um número positivo.` })
    .positive({ error: `Campo "value" deve ser um número positivo.` })
    .optional()
});

export const updatePrizeBodySchema = z.object({
  title: z
    .string()
    .min(AppConstants.ONE, { error: `Campo "title" não pode ser vazio.` })
    .optional(),
  description: z.string({ error: `Campo "description" deve ser uma string.` }).optional(),
  imageUrl: z.url({ error: `Campo "imageUrl" deve ser uma URL válida.` }).optional(),
  prizeOrder: z
    .number({ error: `Campo "prizeOrder" deve ser um número inteiro positivo.` })
    .int({ error: `Campo "prizeOrder" deve ser um número inteiro.` })
    .positive({ error: `Campo "prizeOrder" deve ser um número inteiro positivo.` })
    .optional(),
  value: z
    .number({ error: `Campo "value" deve ser um número positivo.` })
    .positive({ error: `Campo "value" deve ser um número positivo.` })
    .optional()
});
