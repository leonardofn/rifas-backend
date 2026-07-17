import { z } from 'zod';

import { AppConstants } from '@shared/constants';

export const findPaginatedBaseQuerySchema = z.object({
  page: z.preprocess(
    value => {
      const isBlank = typeof value === 'string' && value.trim() === '';
      const isEmpty = value === undefined || value === null;
      if (isBlank || isEmpty) {
        return undefined;
      }

      return value;
    },
    z.coerce
      .number({
        error: `Campo "page" deve ser um número inteiro positivo.`
      })
      .int({
        error: `Campo "page" deve ser um número inteiro positivo.`
      })
      .positive({
        message: `Campo "page" deve ser um número inteiro positivo.`
      })
      .default(AppConstants.DEFAULT_PAGE)
  ),
  limit: z.preprocess(
    value => {
      const isBlank = typeof value === 'string' && value.trim() === '';
      const isEmpty = value === undefined || value === null;
      if (isBlank || isEmpty) {
        return undefined;
      }

      return value;
    },
    z.coerce
      .number({
        error: `Campo "limit" deve ser um número inteiro positivo.`
      })
      .int({
        error: `Campo "limit" deve ser um número inteiro positivo.`
      })
      .positive({
        message: `Campo "limit" deve ser um número inteiro positivo.`
      })
      .default(AppConstants.DEFAULT_LIMIT)
  )
});
