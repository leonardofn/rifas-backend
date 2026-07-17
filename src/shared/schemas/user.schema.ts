import { z } from 'zod';

import { AppConstants } from '@shared/constants';
import { findPaginatedBaseQuerySchema } from './base.schema';

export const userIdParamsSchema = z.object({
  id: z.coerce
    .number({ error: `Parâmetro "id" deve ser um número inteiro positivo.` })
    .int({ error: `Parâmetro "id" deve ser um número inteiro.` })
    .positive({ error: `Parâmetro "id" deve ser um número inteiro positivo.` })
});

const userNameSchema = z
  .string({ error: `Campo "name" é obrigatório e deve ser uma string.` })
  .trim()
  .min(AppConstants.ONE, { error: `Campo "name" não pode ser vazio.` })
  .max(AppConstants.VARCHAR_DEFAULT_LENGTH, {
    error: `Campo "name" deve ter no máximo 255 caracteres.`
  });

const userEmailSchema = z
  .string({ error: `Campo "email" é obrigatório e deve ser uma string.` })
  .trim()
  .toLowerCase()
  .max(AppConstants.VARCHAR_DEFAULT_LENGTH, {
    error: `Campo "email" deve ter no máximo 255 caracteres.`
  })
  .pipe(
    z.email({
      error: `Campo "email" deve ser um e-mail válido.`,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    })
  );

const userPasswordSchema = z
  .string({ error: `Campo "password" é obrigatório e deve ser uma string.` })
  .min(AppConstants.MIN_PASSWORD_LENGTH, {
    error: `Campo "password" deve ter pelo menos 6 caracteres.`
  })
  .max(AppConstants.VARCHAR_DEFAULT_LENGTH, {
    error: `Campo "password" deve ter no máximo 255 caracteres.`
  });

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

export const findUsersPaginatedQuerySchema = findPaginatedBaseQuerySchema.extend({
  search: z
    .string({ error: `Campo "search" deve ser uma string.` })
    .trim()
    .min(AppConstants.ONE, { error: `Campo "search" não pode ser vazio.` })
    .optional()
});
