import { env } from '@config/env';
import {
  type AuthResponseDTO,
  type AuthTokensDTO,
  type ForgotPasswordDTO,
  type LoginDTO,
  type RefreshTokenDTO,
  type RegisterDTO,
  type ResetPasswordDTO
} from '@dtos/auth.dto';
import { type User } from '@entities/user.entity';
import { EmailService } from '@services/email.service';
import { UsersService } from '@services/users.service';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@shared/auth/jwt';
import { AppConstants } from '@shared/constants';
import { AppError } from '@shared/errors/app-error';
import { compare, hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { StatusCodes } from 'http-status-codes';

export class AuthService {
  private readonly usersService: UsersService;
  private readonly emailService: EmailService;

  constructor(usersService = new UsersService(), emailService = new EmailService()) {
    this.usersService = usersService;
    this.emailService = emailService;
  }

  async register(data: RegisterDTO): Promise<AuthResponseDTO> {
    const user = await this.usersService.create(data);
    const tokens = await this.generateAndPersistTokens(user);

    return {
      user: this.mapUserResponse(user),
      tokens
    };
  }

  async login(data: LoginDTO): Promise<AuthResponseDTO> {
    const email = data.email.trim().toLowerCase();

    const userWithCredentials = await this.usersService.findByEmailWithCredentials(email);

    if (!userWithCredentials?.password) {
      throw new AppError('E-mail ou senha inválidos.', StatusCodes.UNAUTHORIZED);
    }

    const isPasswordValid = await compare(data.password, userWithCredentials.password);

    if (!isPasswordValid) {
      throw new AppError('E-mail ou senha inválidos.', StatusCodes.UNAUTHORIZED);
    }

    const tokens = await this.generateAndPersistTokens(userWithCredentials);

    return {
      user: this.mapUserResponse(userWithCredentials),
      tokens
    };
  }

  async refresh(data: RefreshTokenDTO): Promise<AuthTokensDTO> {
    const payload = verifyRefreshToken(data.refreshToken);
    const userId = Number(payload.sub);

    if (!Number.isInteger(userId) || userId <= AppConstants.ZERO) {
      throw new AppError('Refresh token inválido.', StatusCodes.UNAUTHORIZED);
    }

    const user = await this.usersService.findByIdWithRefreshToken(userId);

    if (!user?.refreshTokenHash || !user.refreshTokenExpiresAt) {
      throw new AppError('Refresh token inválido.', StatusCodes.UNAUTHORIZED);
    }

    if (user.refreshTokenExpiresAt.getTime() < Date.now()) {
      await this.usersService.clearRefreshToken(userId);
      throw new AppError('Refresh token expirado.', StatusCodes.UNAUTHORIZED);
    }

    const isRefreshTokenValid = await compare(data.refreshToken, user.refreshTokenHash);

    if (!isRefreshTokenValid) {
      throw new AppError('Refresh token inválido.', StatusCodes.UNAUTHORIZED);
    }

    return await this.generateAndPersistTokens(user);
  }

  async me(userId: number): Promise<AuthResponseDTO['user']> {
    const user = await this.usersService.findById(userId);
    return this.mapUserResponse(user);
  }

  async logout(userId: number): Promise<void> {
    await this.usersService.findById(userId);
    await this.usersService.clearRefreshToken(userId);
  }

  async forgotPassword(data: ForgotPasswordDTO): Promise<void> {
    const email = data.email.trim().toLowerCase();
    const user = await this.usersService.findByEmailWithCredentials(email);

    // Retorna silenciosamente se o e-mail não existir (proteção anti-enumeração)
    if (!user) {
      return;
    }

    const randomPart = randomBytes(AppConstants.PASSWORD_RESET_TOKEN_BYTE_LENGTH).toString('hex');
    const resetToken = `${user.id}.${randomPart}`;
    const resetTokenHash = await hash(resetToken, AppConstants.BCRYPT_SALT_ROUNDS);
    const passwordResetTokenTtlInMilliseconds =
      AppConstants.PASSWORD_RESET_TOKEN_TTL_SECONDS * AppConstants.MILLISECONDS_IN_SECOND;
    const resetTokenExpiresAt = new Date(Date.now() + passwordResetTokenTtlInMilliseconds);

    await this.usersService.updatePasswordResetToken(user.id, resetTokenHash, resetTokenExpiresAt);
    await this.emailService.sendPasswordResetEmail(email, resetToken);
  }

  async resetPassword(data: ResetPasswordDTO): Promise<void> {
    const dotIndex = data.token.indexOf('.');

    if (dotIndex === -1) {
      throw new AppError('Token de redefinição inválido.', StatusCodes.UNAUTHORIZED);
    }

    const userId = Number(data.token.substring(AppConstants.ZERO, dotIndex));

    if (!Number.isInteger(userId) || userId <= AppConstants.ZERO) {
      throw new AppError('Token de redefinição inválido.', StatusCodes.UNAUTHORIZED);
    }

    const user = await this.usersService.findByIdWithPasswordReset(userId);

    if (!user?.passwordResetTokenHash || !user.passwordResetTokenExpiresAt) {
      throw new AppError('Token de redefinição inválido.', StatusCodes.UNAUTHORIZED);
    }

    if (user.passwordResetTokenExpiresAt.getTime() < Date.now()) {
      await this.usersService.clearPasswordResetToken(userId);
      throw new AppError('Token de redefinição expirado.', StatusCodes.UNAUTHORIZED);
    }

    const isTokenValid = await compare(data.token, user.passwordResetTokenHash);

    if (!isTokenValid) {
      throw new AppError('Token de redefinição inválido.', StatusCodes.UNAUTHORIZED);
    }

    await this.usersService.updatePassword(userId, data.password);
    await this.usersService.clearPasswordResetToken(userId);
  }

  private mapUserResponse(user: User): AuthResponseDTO['user'] {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  private async generateAndPersistTokens(user: User): Promise<AuthTokensDTO> {
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    const refreshTokenHash = await hash(refreshToken, AppConstants.BCRYPT_SALT_ROUNDS);
    const refreshTokenExpiresAt = new Date(
      Date.now() + env.jwtRefreshTokenTtlSeconds * AppConstants.MILLISECONDS_IN_SECOND
    );

    await this.usersService.updateRefreshToken(user.id, refreshTokenHash, refreshTokenExpiresAt);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: env.jwtAccessTokenTtlSeconds
    };
  }
}
