import { AppConstants } from '@shared/constants';
import { PaymentStatus } from '@shared/enums/payment-status';
import { z } from 'zod';

export const purchaseIdParamsSchema = z.object({
  id: z.coerce
    .number({ error: `Parâmetro "id" deve ser um número inteiro positivo.` })
    .int({ error: `Parâmetro "id" deve ser um número inteiro.` })
    .positive({ error: `Parâmetro "id" deve ser um número inteiro positivo.` })
});

export const purchaseRaffleIdParamsSchema = z.object({
  raffleId: z.coerce
    .number({ error: `Parâmetro "raffleId" deve ser um número inteiro positivo.` })
    .int({ error: `Parâmetro "raffleId" deve ser um número inteiro.` })
    .positive({ error: `Parâmetro "raffleId" deve ser um número inteiro positivo.` })
});

export const purchaseUserIdParamsSchema = z.object({
  userId: z.coerce
    .number({ error: `Parâmetro "userId" deve ser um número inteiro positivo.` })
    .int({ error: `Parâmetro "userId" deve ser um número inteiro.` })
    .positive({ error: `Parâmetro "userId" deve ser um número inteiro positivo.` })
});

export const createRafflePurchaseBodySchema = z.object({
  raffleId: z
    .number({ error: `Campo "raffleId" é obrigatório e deve ser um número.` })
    .int()
    .positive(),
  userId: z
    .number({ error: `Campo "userId" é obrigatório e deve ser um número.` })
    .int()
    .positive(),
  numberBought: z
    .number({ error: `Campo "numberBought" é obrigatório e deve ser um número.` })
    .int({ error: `Campo "numberBought" deve ser um número inteiro.` })
    .min(AppConstants.ZERO, {
      error: `Campo "numberBought" deve ser um número não negativo.`
    }),
  amountPaid: z
    .number({ error: `Campo "amountPaid" é obrigatório e deve ser um número.` })
    .positive({ error: `Campo "amountPaid" deve ser um número positivo.` })
});

export const updateRafflePurchaseBodySchema = z.object({
  paymentStatus: z
    .enum(Object.values(PaymentStatus) as [string, ...string[]], {
      error: `Campo "paymentStatus" deve ser um valor válido: ${Object.values(PaymentStatus).join(', ')}.`
    })
    .optional()
});

export const findPurchasesPaginatedQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  paymentStatus: z.enum(Object.values(PaymentStatus)).optional()
});
