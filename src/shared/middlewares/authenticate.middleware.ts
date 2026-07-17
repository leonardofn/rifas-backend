import { verifyAccessToken } from '@shared/auth/jwt';
import { AppError } from '@shared/errors/app-error';
import { type NextFunction, type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authorization = req.header('authorization');

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new AppError('Token de autenticação não informado.', StatusCodes.UNAUTHORIZED));
    return;
  }

  const token = authorization.replace('Bearer ', '').trim();

  if (!token) {
    next(new AppError('Token de autenticação inválido.', StatusCodes.UNAUTHORIZED));
    return;
  }

  const payload = verifyAccessToken(token);
  const userId = Number(payload.sub);

  if (!Number.isInteger(userId) || userId <= 0) {
    next(new AppError('Token de autenticação inválido.', StatusCodes.UNAUTHORIZED));
    return;
  }

  req.authUser = {
    id: userId,
    email: payload.email
  };

  next();
}
