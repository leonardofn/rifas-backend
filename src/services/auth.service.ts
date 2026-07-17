import { env } from '@config/env';
import {
  type AuthResponseDTO,
  type AuthTokensDTO,
  type LoginDTO,
  type RefreshTokenDTO,
  type RegisterDTO
} from '@dtos/auth.dto';
import { type User } from '@entities/user.entity';
import { UsersService } from '@services/users.service';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@shared/auth/jwt';
import { AppError } from '@shared/errors/app-error';
import { compare, hash } from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';

export class AuthService {
  private readonly usersService: UsersService;

  private static readonly BCRYPT_SALT_ROUNDS = 12;

  constructor(usersService = new UsersService()) {
    this.usersService = usersService;
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

    if (!Number.isInteger(userId) || userId <= 0) {
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

    const refreshTokenHash = await hash(refreshToken, AuthService.BCRYPT_SALT_ROUNDS);
    const refreshTokenExpiresAt = new Date(Date.now() + env.jwtRefreshTokenTtlSeconds * 1000);

    await this.usersService.updateRefreshToken(user.id, refreshTokenHash, refreshTokenExpiresAt);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: env.jwtAccessTokenTtlSeconds
    };
  }
}
