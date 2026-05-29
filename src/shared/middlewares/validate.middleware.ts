import { type NextFunction, type Request, type Response } from 'express';
import { type ZodType } from 'zod';

import { AppError } from '@shared/errors/app-error';

type ValidateTarget = 'body' | 'params' | 'query';

export function validate(schema: ZodType, target: ValidateTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const message = result.error.issues.map(i => i.message).join('; ');
      next(new AppError(message, 400));
      return;
    }

    req[target] = result.data;
    next();
  };
}
