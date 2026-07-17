import { type PaginatedResponse } from '@dtos/pagination.dto';
import { type CreateUserDTO, type UpdateUserDTO, type UserFiltersDTO } from '@dtos/user.dto';
import { type User } from '@entities/user.entity';
import { UsersRepository } from '@repositories/users.repository';
import { AppError } from '@shared/errors/app-error';
import { hash } from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { type UpdateResult } from 'typeorm';

export class UsersService {
  private readonly usersRepository: UsersRepository;

  private static readonly PAGINATION_MAX_LIMIT = 100;
  private static readonly BCRYPT_SALT_ROUNDS = 12;

  constructor(usersRepository = new UsersRepository()) {
    this.usersRepository = usersRepository;
  }

  async create(data: CreateUserDTO): Promise<User> {
    const sanitizedData = this.validateAndSanitizeCreateData(data);
    await this.ensureEmailIsAvailable(sanitizedData.email);

    sanitizedData.password = await this.hashPassword(sanitizedData.password);

    const createdUser = await this.usersRepository.create(sanitizedData);
    return await this.findById(createdUser.id);
  }

  async findById(id: number): Promise<User> {
    this.validateId(id);

    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new AppError('Usuário não encontrado.', StatusCodes.NOT_FOUND);
    }

    return user;
  }

  async findPaginated(
    page = 1,
    limit = 12,
    filters?: UserFiltersDTO
  ): Promise<PaginatedResponse<User>> {
    this.validatePagination(page, limit);

    const normalizedFilters = this.normalizeFilters(filters);

    return await this.usersRepository.findPaginated(page, limit, normalizedFilters);
  }

  async findByEmailWithCredentials(email: string): Promise<User | null> {
    return await this.usersRepository.findByEmailWithCredentials(email);
  }

  async findByIdWithRefreshToken(id: number): Promise<User | null> {
    return await this.usersRepository.findByIdWithRefreshToken(id);
  }

  async update(id: number, data: UpdateUserDTO): Promise<User> {
    await this.findById(id);

    const sanitizedData = this.validateAndSanitizeUpdateData(data);

    if (sanitizedData.email) {
      await this.ensureEmailIsAvailable(sanitizedData.email, id);
    }

    if (sanitizedData.password) {
      sanitizedData.password = await this.hashPassword(sanitizedData.password);
    }

    await this.usersRepository.update(id, sanitizedData);
    return await this.findById(id);
  }

  async updateRefreshToken(
    id: number,
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date
  ): Promise<UpdateResult> {
    return await this.usersRepository.updateRefreshToken(
      id,
      refreshTokenHash,
      refreshTokenExpiresAt
    );
  }

  async clearRefreshToken(id: number): Promise<UpdateResult> {
    return await this.usersRepository.clearRefreshToken(id);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.usersRepository.delete(id);
  }

  private validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError('ID do usuário inválido.', StatusCodes.BAD_REQUEST);
    }
  }

  private validatePagination(page: number, limit: number): void {
    if (!Number.isInteger(page) || page <= 0) {
      throw new AppError(
        `Parâmetro "page" deve ser um número inteiro maior que zero.`,
        StatusCodes.BAD_REQUEST
      );
    }

    if (!Number.isInteger(limit) || limit <= 0 || limit > UsersService.PAGINATION_MAX_LIMIT) {
      throw new AppError(
        `Parâmetro "limit" deve ser um número inteiro entre 1 e ${UsersService.PAGINATION_MAX_LIMIT}.`,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  private async ensureEmailIsAvailable(email: string, currentUserId?: number): Promise<void> {
    const existingUser = await this.usersRepository.findByEmail(email);

    if (!existingUser) {
      return;
    }

    if (currentUserId && existingUser.id === currentUserId) {
      return;
    }

    throw new AppError('Já existe um usuário com este e-mail.', StatusCodes.CONFLICT);
  }

  private validateAndSanitizeCreateData(data: CreateUserDTO): CreateUserDTO {
    const name = this.normalizeRequiredText(data.name, 'Nome do usuário é obrigatório.');
    const email = this.normalizeAndValidateEmail(data.email);
    const password = this.validateAndNormalizePassword(data.password);

    return {
      name,
      email,
      password
    };
  }

  private validateAndSanitizeUpdateData(data: UpdateUserDTO): UpdateUserDTO {
    if (Object.keys(data).length === 0) {
      throw new AppError(
        'É necessário informar ao menos um campo para atualização.',
        StatusCodes.BAD_REQUEST
      );
    }

    const sanitized: UpdateUserDTO = {};

    if (data.name !== undefined) {
      sanitized.name = this.normalizeRequiredText(data.name, 'Nome do usuário é obrigatório.');
    }

    if (data.email !== undefined) {
      sanitized.email = this.normalizeAndValidateEmail(data.email);
    }

    if (data.password !== undefined) {
      sanitized.password = this.validateAndNormalizePassword(data.password);
    }

    if (Object.keys(sanitized).length === 0) {
      throw new AppError('Não há campos válidos para atualização.', StatusCodes.BAD_REQUEST);
    }

    return sanitized;
  }

  private normalizeFilters(filters?: UserFiltersDTO): UserFiltersDTO | undefined {
    if (!filters) {
      return undefined;
    }

    const normalizedSearch = filters.search?.trim();

    if (!normalizedSearch) {
      return undefined;
    }

    return { search: normalizedSearch };
  }

  private normalizeRequiredText(value: string, errorMessage: string): string {
    const normalized = value?.trim();

    if (!normalized) {
      throw new AppError(errorMessage, StatusCodes.BAD_REQUEST);
    }

    return normalized;
  }

  private normalizeAndValidateEmail(email: string): string {
    const normalized = this.normalizeRequiredText(
      email,
      'E-mail do usuário é obrigatório.'
    ).toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalized)) {
      throw new AppError('E-mail do usuário inválido.', StatusCodes.BAD_REQUEST);
    }

    return normalized;
  }

  private validateAndNormalizePassword(password: string): string {
    const normalized = this.normalizeRequiredText(password, 'Senha do usuário é obrigatória.');

    if (normalized.length < 6) {
      throw new AppError(
        'A senha do usuário deve ter pelo menos 6 caracteres.',
        StatusCodes.BAD_REQUEST
      );
    }

    return normalized;
  }

  private async hashPassword(password: string): Promise<string> {
    return await hash(password, UsersService.BCRYPT_SALT_ROUNDS);
  }
}
