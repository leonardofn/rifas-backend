import { env } from '@config/env';
import { AppError } from '@shared/errors/app-error';
import jwt, { type JwtPayload } from 'jsonwebtoken';

import { StatusCodes } from 'http-status-codes';

type JwtTokenType = 'access' | 'refresh';

export type VerifiedJwtPayload = JwtPayload & {
  sub: string;
  email: string;
  type: JwtTokenType;
};

function signToken(userId: number, email: string, type: JwtTokenType): string {
  const secret = type === 'access' ? env.jwtAccessSecret : env.jwtRefreshSecret;
  const expiresIn =
    type === 'access' ? env.jwtAccessTokenTtlSeconds : env.jwtRefreshTokenTtlSeconds;

  return jwt.sign(
    {
      email,
      type
    },
    secret,
    {
      subject: String(userId),
      expiresIn
    }
  );
}

function verifyToken(token: string, expectedType: JwtTokenType): VerifiedJwtPayload {
  try {
    const secret = expectedType === 'access' ? env.jwtAccessSecret : env.jwtRefreshSecret;
    const decoded = jwt.verify(token, secret);

    if (typeof decoded === 'string') {
      throw new AppError('Token inválido.', StatusCodes.UNAUTHORIZED);
    }

    if (
      decoded.type !== expectedType ||
      typeof decoded.sub !== 'string' ||
      typeof decoded.email !== 'string'
    ) {
      throw new AppError('Token inválido.', StatusCodes.UNAUTHORIZED);
    }

    return decoded as VerifiedJwtPayload;
  } catch {
    throw new AppError('Token inválido ou expirado.', StatusCodes.UNAUTHORIZED);
  }
}

export function generateAccessToken(userId: number, email: string): string {
  return signToken(userId, email, 'access');
}

export function generateRefreshToken(userId: number, email: string): string {
  return signToken(userId, email, 'refresh');
}

export function verifyAccessToken(token: string): VerifiedJwtPayload {
  return verifyToken(token, 'access');
}

export function verifyRefreshToken(token: string): VerifiedJwtPayload {
  return verifyToken(token, 'refresh');
}
