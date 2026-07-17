import { env } from '@config/env';
import { AppError } from '@shared/errors/app-error';
import Logger from '@shared/loggers/logger';
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

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
    return new AppError('JSON inválido no corpo da requisição.', StatusCodes.BAD_REQUEST);
  }

  if (error instanceof Error) {
    return new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return new AppError('Erro interno do servidor.', StatusCodes.INTERNAL_SERVER_ERROR);
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  const appError = normalizeError(error);

  if (appError.statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) {
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
