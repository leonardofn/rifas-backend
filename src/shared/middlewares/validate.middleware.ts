import { type NextFunction, type Request, type Response } from 'express';
import { type ZodType } from 'zod';

import { AppError } from '@shared/errors/app-error';
import { StatusCodes } from 'http-status-codes';

type ValidateTarget = 'body' | 'params' | 'query';

export function validate(schema: ZodType, target: ValidateTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const message = result.error.issues.map(i => i.message).join('; ');
      next(new AppError(message, StatusCodes.BAD_REQUEST));
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
