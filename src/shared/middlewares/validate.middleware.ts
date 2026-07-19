import { type NextFunction, type Request, type Response } from 'express';
import { type ZodType } from 'zod';

import { AppError } from '@shared/errors/app-error';
import { StatusCodes } from 'http-status-codes';

type ValidateTarget = 'body' | 'params' | 'query';

export function validate(schema: ZodType, target: ValidateTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const validationErrors = result.error.issues.reduce(
        (acc, issue) => {
          acc[issue.path.join('.')] = issue.message;
          return acc;
        },
        {} as Record<string, string>
      );

      const error = new AppError(
        'Erro de validação dos dados de entrada.',
        StatusCodes.BAD_REQUEST,
        validationErrors
      );

      next(error);
      return;
    }

    if (target === 'query') {
      Object.defineProperty(req, 'query', {
        value: result.data,
        writable: true,
        enumerable: true,
        configurable: true
      });
      next();
      return;
    }

    req[target] = result.data;
    next();
  };
}
