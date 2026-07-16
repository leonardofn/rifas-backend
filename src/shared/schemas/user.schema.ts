import { z } from 'zod';

export const userIdParamsSchema = z.object({
  id: z.coerce
    .number({ error: `Parâmetro "id" deve ser um número inteiro positivo.` })
    .int({ error: `Parâmetro "id" deve ser um número inteiro.` })
    .positive({ error: `Parâmetro "id" deve ser um número inteiro positivo.` })
});

const userNameSchema = z
  .string({ error: `Campo "name" é obrigatório e deve ser uma string.` })
  .trim()
  .min(1, { error: `Campo "name" não pode ser vazio.` })
  .max(255, { error: `Campo "name" deve ter no máximo 255 caracteres.` });

const userEmailSchema = z
  .string({ error: `Campo "email" é obrigatório e deve ser uma string.` })
  .trim()
  .toLowerCase()
  .max(255, { error: `Campo "email" deve ter no máximo 255 caracteres.` })
  .pipe(
    z.email({
      error: `Campo "email" deve ser um e-mail válido.`,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    })
  );

const userPasswordSchema = z
  .string({ error: `Campo "password" é obrigatório e deve ser uma string.` })
  .min(6, { error: `Campo "password" deve ter pelo menos 6 caracteres.` })
  .max(255, { error: `Campo "password" deve ter no máximo 255 caracteres.` });

export const createUserBodySchema = z.object({
  name: userNameSchema,
  email: userEmailSchema,
  password: userPasswordSchema
});

export const updateUserBodySchema = z.object({
  name: userNameSchema.optional(),
  email: userEmailSchema.optional(),
  password: userPasswordSchema.optional()
});

export const findUsersPaginatedQuerySchema = z.object({
  page: z.coerce
    .number({
      error: `Campo "page" deve ser um número inteiro positivo.`
    })
    .int({
      error: `Campo "page" deve ser um número inteiro positivo.`
    })
    .positive({
      error: `Campo "page" deve ser um número inteiro positivo.`
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
      error: `Campo "limit" deve ser um número inteiro positivo.`
    })
    .default(10),
  search: z
    .string({ error: `Campo "search" deve ser uma string.` })
    .trim()
    .min(1, { error: `Campo "search" não pode ser vazio.` })
    .optional()
});
