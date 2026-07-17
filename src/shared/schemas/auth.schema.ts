import { z } from 'zod';

import { AppConstants } from '@shared/constants';

const nameSchema = z
  .string({ error: `Campo "name" é obrigatório e deve ser uma string.` })
  .trim()
  .min(AppConstants.ONE, { error: `Campo "name" não pode ser vazio.` })
  .max(AppConstants.VARCHAR_DEFAULT_LENGTH, {
    error: `Campo "name" deve ter no máximo 255 caracteres.`
  });

const emailSchema = z
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

const passwordSchema = z
  .string({ error: `Campo "password" é obrigatório e deve ser uma string.` })
  .min(AppConstants.MIN_PASSWORD_LENGTH, {
    error: `Campo "password" deve ter pelo menos 6 caracteres.`
  })
  .max(AppConstants.VARCHAR_DEFAULT_LENGTH, {
    error: `Campo "password" deve ter no máximo 255 caracteres.`
  });

export const registerBodySchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema
});

export const loginBodySchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export const refreshTokenBodySchema = z.object({
  refreshToken: z
    .string({ error: `Campo "refreshToken" é obrigatório e deve ser uma string.` })
    .trim()
    .min(AppConstants.ONE, { error: `Campo "refreshToken" não pode ser vazio.` })
});
