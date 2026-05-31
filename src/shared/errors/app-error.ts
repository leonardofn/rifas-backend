import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    details?: unknown,
    originalError?: Error
  ) {
    // Passa o erro original para a propriedade 'cause' (suportada nativamente no ES2022+)
    super(message, { cause: originalError });

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    // Cria um status 'fail' para erros 4xx e 'error' para 5xx
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = statusCode < StatusCodes.INTERNAL_SERVER_ERROR;
    this.details = details;

    // Garante que o stack trace não inclua o construtor do AppError
    Error.captureStackTrace?.(this, this.constructor);
  }
}
