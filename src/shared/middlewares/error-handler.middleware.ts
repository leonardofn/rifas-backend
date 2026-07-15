import { env } from '@config/env';
import { AppError } from '@shared/errors/app-error';
import Logger from '@shared/loggers/logger';
import type { NextFunction, Request, Response } from 'express';

type ErrorResponse = {
  statusCode: number;
  status: string;
  isOperational: boolean;
  message: string;
  details?: unknown;
  stack?: string;
};

function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof SyntaxError) {
    return new AppError('JSON inválido no corpo da requisição.', 400);
  }

  if (error instanceof Error) {
    return new AppError(error.message, 500);
  }

  return new AppError('Erro interno do servidor.', 500);
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  const appError = normalizeError(error);

  if (appError.statusCode >= 500) {
    Logger.logError(`❌ ${appError.message}`);
  }

  const payload: ErrorResponse = {
    statusCode: appError.statusCode,
    status: appError.status,
    isOperational: appError.isOperational,
    message: appError.message
  };

  if (appError.details !== undefined) {
    payload.details = appError.details;
  }

  if (env.nodeEnv !== 'production' && appError.stack) {
    payload.stack = appError.stack;
  }

  return res.status(appError.statusCode).json(payload);
}
