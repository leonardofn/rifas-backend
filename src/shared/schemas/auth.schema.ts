import { z } from 'zod';

const nameSchema = z
  .string({ error: `Campo "name" é obrigatório e deve ser uma string.` })
  .trim()
  .min(1, { error: `Campo "name" não pode ser vazio.` })
  .max(255, { error: `Campo "name" deve ter no máximo 255 caracteres.` });

const emailSchema = z
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

const passwordSchema = z
  .string({ error: `Campo "password" é obrigatório e deve ser uma string.` })
  .min(6, { error: `Campo "password" deve ter pelo menos 6 caracteres.` })
  .max(255, { error: `Campo "password" deve ter no máximo 255 caracteres.` });

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
    .min(1, { error: `Campo "refreshToken" não pode ser vazio.` })
});
