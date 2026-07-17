import { type PaginatedResponse } from '@dtos/pagination.dto';
import {
  type CreateRaffleDTO,
  type TrendingRaffleDTO,
  type UpdateRaffleDTO
} from '@dtos/raffle.dto';
import { type Raffle } from '@entities/raffle.entity';
import { PrizesRepository } from '@repositories/prizes.repository';
import { RaffleRepository } from '@repositories/raffles.repository';
import { RaffleStatus } from '@shared/enums/ruffle-status';
import { AppError } from '@shared/errors/app-error';
import { StatusCodes } from 'http-status-codes';

type RaffleFilters = { status?: RaffleStatus; userId?: number };

export class RafflesService {
  private readonly rafflesRepository: RaffleRepository;
  private readonly prizesRepository: PrizesRepository;

  private static readonly PAGINATION_MAX_LIMIT = 100;

  private static readonly ALLOWED_STATUS_TRANSITIONS: Readonly<
    Record<RaffleStatus, readonly RaffleStatus[]>
  > = {
    [RaffleStatus.PENDING]: [RaffleStatus.OPEN, RaffleStatus.CANCELLED],
    [RaffleStatus.OPEN]: [RaffleStatus.DRAWN, RaffleStatus.CLOSED, RaffleStatus.CANCELLED],
    [RaffleStatus.DRAWN]: [RaffleStatus.CLOSED],
    [RaffleStatus.CLOSED]: [],
    [RaffleStatus.CANCELLED]: []
  };

  private static readonly RAFFLE_STATUS_DESCRIPTIONS: Readonly<Record<RaffleStatus, string>> = {
    [RaffleStatus.PENDING]: 'Pendente',
    [RaffleStatus.OPEN]: 'Aberta',
    [RaffleStatus.DRAWN]: 'Sorteada',
    [RaffleStatus.CLOSED]: 'Encerrada',
    [RaffleStatus.CANCELLED]: 'Cancelada'
  };

  private static readonly NON_EDITABLE_STATUSES = new Set<RaffleStatus>([
    RaffleStatus.DRAWN,
    RaffleStatus.CLOSED,
    RaffleStatus.CANCELLED
  ]);

  private static readonly DELETABLE_STATUSES = new Set<RaffleStatus>([
    RaffleStatus.PENDING,
    RaffleStatus.CANCELLED
  ]);

  constructor(
    raffleRepository = new RaffleRepository(),
    prizesRepository = new PrizesRepository()
  ) {
    this.rafflesRepository = raffleRepository;
    this.prizesRepository = prizesRepository;
  }

  async create(data: CreateRaffleDTO): Promise<Raffle> {
    const sanitizedRaffleData = this.validateAndSanitizeRaffleData(data);
    return await this.rafflesRepository.create(sanitizedRaffleData);
  }

  async findById(id: number): Promise<Raffle> {
    this.validateId(id);

    const raffle = await this.rafflesRepository.findById(id);

    if (!raffle) {
      throw new AppError('Rifa não encontrada.', StatusCodes.NOT_FOUND);
    }

    return raffle;
  }

  async findByPublicId(publicId: string): Promise<Raffle> {
    const trimmed = publicId.trim();

    if (!trimmed) {
      throw new AppError('Public ID da rifa é obrigatório.', StatusCodes.BAD_REQUEST);
    }

    const raffle = await this.rafflesRepository.findByPublicId(trimmed);

    if (!raffle) {
      throw new AppError('Rifa não encontrada.', StatusCodes.NOT_FOUND);
    }

    return raffle;
  }

  async findPaginated(
    page = 1,
    limit = 10,
    filters?: RaffleFilters
  ): Promise<PaginatedResponse<Raffle>> {
    this.validatePagination(page, limit);
    return await this.rafflesRepository.findPaginated(page, limit, this.normalizeFilters(filters));
  }

  async findTrendingRafflesPaginated(
    page: number,
    limit: number
  ): Promise<PaginatedResponse<TrendingRaffleDTO>> {
    this.validatePagination(page, limit);
    return await this.rafflesRepository.findTrendingRafflesPaginated(page, limit);
  }

  async update(id: number, data: UpdateRaffleDTO): Promise<Raffle> {
    const raffle = await this.findById(id);

    this.ensureRaffleIsEditable(raffle.status);

    await this.rafflesRepository.update(id, this.sanitizeUpdateData(data));

    return await this.findById(id);
  }

  async changeStatus(id: number, newStatus: RaffleStatus): Promise<Raffle> {
    const raffle = await this.findById(id);

    if (raffle.status === newStatus) {
      return raffle;
    }

    this.ensureAllowedStatusTransition(raffle.status, newStatus);

    await this.validateRaffleStatus(newStatus, raffle);

    await this.rafflesRepository.changeStatus(id, newStatus);

    return await this.findById(id);
  }

  async findByUserId(userId: number): Promise<Raffle[]> {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new AppError('ID do usuário inválido.', StatusCodes.BAD_REQUEST);
    }

    return await this.rafflesRepository.findByUserId(userId);
  }

  async delete(id: number): Promise<void> {
    const raffle = await this.findById(id);

    if (!RafflesService.DELETABLE_STATUSES.has(raffle.status)) {
      throw new AppError(
        'Só é permitido excluir rifas pendentes ou canceladas.',
        StatusCodes.CONFLICT,
        { currentStatus: raffle.status }
      );
    }

    await this.rafflesRepository.delete(id);
  }

  async incrementTotalCollected(id: number, amount: number): Promise<Raffle> {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new AppError(
        'O valor para incrementar o total arrecadado deve ser maior que zero.',
        StatusCodes.BAD_REQUEST
      );
    }

    const raffle = await this.findById(id);

    if (raffle.status !== RaffleStatus.OPEN) {
      throw new AppError('Só é permitido arrecadar em rifas abertas.', StatusCodes.CONFLICT, {
        currentStatus: raffle.status
      });
    }

    await this.rafflesRepository.incrementTotalCollected(id, amount);

    return await this.findById(id);
  }

  private async validateRaffleStatus(newStatus: RaffleStatus, raffle: Raffle): Promise<void> {
    if (newStatus === RaffleStatus.OPEN) {
      // Se a rifa estiver sendo marcada como aberta, garante que ela tenha uma data de sorteio definida
      if (!raffle.drawDate) {
        throw new AppError(
          'Não é possível abrir uma rifa sem data de sorteio.',
          StatusCodes.BAD_REQUEST
        );
      }

      // Se a rifa tiver data de sorteio definida, garante que ela seja no futuro
      if (raffle.drawDate <= new Date()) {
        throw new AppError(
          'Não é possível abrir uma rifa com data de sorteio no passado.',
          StatusCodes.BAD_REQUEST
        );
      }

      // Garante que a rifa tenha prêmios definidos antes de ser aberta
      const prizes = await this.prizesRepository.findByRaffleId(raffle.id);
      if (prizes.length === 0) {
        throw new AppError(
          'Não é possível abrir uma rifa sem prêmios definidos.',
          StatusCodes.BAD_REQUEST
        );
      }
    }

    // Se a rifa estiver sendo marcada como sorteada e ainda não tiver data de sorteio, define a data atual como data do sorteio
    if (newStatus === RaffleStatus.DRAWN && !raffle.drawDate) {
      await this.rafflesRepository.update(raffle.id, { drawDate: new Date() });
    }
  }

  private validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError('ID da rifa inválido.', StatusCodes.BAD_REQUEST);
    }
  }

  private validatePagination(page: number, limit: number): void {
    if (!Number.isInteger(page) || page <= 0) {
      throw new AppError(
        `Parâmetro "page" deve ser um número inteiro maior que zero.`,
        StatusCodes.BAD_REQUEST
      );
    }

    if (!Number.isInteger(limit) || limit <= 0 || limit > RafflesService.PAGINATION_MAX_LIMIT) {
      throw new AppError(
        `Parâmetro "limit" deve ser um número inteiro entre 1 e ${RafflesService.PAGINATION_MAX_LIMIT}.`,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  private validateAndSanitizeRaffleData(data: CreateRaffleDTO): CreateRaffleDTO {
    const { userId, startNumber, endNumber, title, pricePerNumber, drawDate } = data;
    this.validateUserId(userId);
    this.validateNumbersRange(startNumber, endNumber);
    this.validatePricePerNumber(pricePerNumber);

    const description = this.normalizeOptionalText(data.description);
    const imageUrl = this.normalizeOptionalText(data.imageUrl);

    if (imageUrl) {
      this.validateImageUrl(imageUrl);
    }

    const sanitized: CreateRaffleDTO = {
      userId,
      title: this.normalizeRequiredText(title, 'Título da rifa é obrigatório.'),
      startNumber,
      endNumber,
      pricePerNumber
    };

    if (description) sanitized.description = description;
    if (imageUrl) sanitized.imageUrl = imageUrl;
    if (drawDate) {
      const raffleDrawDate = new Date(drawDate);

      if (!(raffleDrawDate instanceof Date) || isNaN(raffleDrawDate.getTime())) {
        throw new AppError('Data de sorteio inválida.', StatusCodes.BAD_REQUEST);
      }

      if (raffleDrawDate <= new Date()) {
        throw new AppError('A data de sorteio deve ser no futuro.', StatusCodes.BAD_REQUEST);
      }

      sanitized.drawDate = raffleDrawDate;
    }

    return sanitized;
  }

  private sanitizeUpdateData(data: UpdateRaffleDTO): UpdateRaffleDTO {
    if (Object.keys(data).length === 0) {
      throw new AppError(
        'É necessário informar ao menos um campo para atualização.',
        StatusCodes.BAD_REQUEST
      );
    }

    if (data.status) {
      throw new AppError(
        'Use o método de alteração de status para atualizar o status da rifa.',
        StatusCodes.BAD_REQUEST
      );
    }

    const sanitized: UpdateRaffleDTO = {};

    if (data.title) {
      sanitized.title = this.normalizeRequiredText(data.title, 'Título da rifa é obrigatório.');
    }

    if (data.description) {
      sanitized.description = this.normalizeOptionalText(data.description) ?? '';
    }

    if (data.imageUrl) {
      const imageUrl = this.normalizeOptionalText(data.imageUrl) ?? '';

      if (imageUrl) {
        this.validateImageUrl(imageUrl);
      }

      sanitized.imageUrl = imageUrl;
    }

    if (data.drawDate) {
      const raffleDrawDate = new Date(data.drawDate);

      if (!(raffleDrawDate instanceof Date) || isNaN(raffleDrawDate.getTime())) {
        throw new AppError('Data de sorteio inválida.', StatusCodes.BAD_REQUEST);
      }

      if (raffleDrawDate <= new Date()) {
        throw new AppError('A data de sorteio deve ser no futuro.', StatusCodes.BAD_REQUEST);
      }

      sanitized.drawDate = raffleDrawDate;
    }

    if (Object.keys(sanitized).length === 0) {
      throw new AppError('Não há campos válidos para atualização.', StatusCodes.BAD_REQUEST);
    }

    return sanitized;
  }

  private ensureAllowedStatusTransition(
    currentStatus: RaffleStatus,
    nextStatus: RaffleStatus
  ): void {
    const allowedTransitions = RafflesService.ALLOWED_STATUS_TRANSITIONS[currentStatus];

    if (!allowedTransitions.includes(nextStatus)) {
      const currentStatusDescription = RafflesService.RAFFLE_STATUS_DESCRIPTIONS[currentStatus];
      const nextStatusDescription = RafflesService.RAFFLE_STATUS_DESCRIPTIONS[nextStatus];
      throw new AppError(
        `Transição de status da rifa de "${currentStatusDescription}" para "${nextStatusDescription}" não é permitida.`,
        StatusCodes.CONFLICT,
        {
          currentStatus,
          nextStatus,
          allowedTransitions
        }
      );
    }
  }

  private ensureRaffleIsEditable(status: RaffleStatus): void {
    const isStatusEditable = RafflesService.NON_EDITABLE_STATUSES.has(status);
    if (isStatusEditable) {
      const statusDescription = RafflesService.RAFFLE_STATUS_DESCRIPTIONS[status];
      throw new AppError(
        `Não é permitido editar rifas ${statusDescription.toLowerCase()}s.`,
        StatusCodes.CONFLICT,
        { currentStatus: status }
      );
    }
  }

  private validateUserId(userId: number): void {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new AppError('O ID do usuário da rifa é inválido.', StatusCodes.BAD_REQUEST);
    }
  }

  private validateNumbersRange(startNumber: number, endNumber: number): void {
    if (!Number.isInteger(startNumber) || !Number.isInteger(endNumber)) {
      throw new AppError(
        'Os números inicial e final da rifa devem ser inteiros.',
        StatusCodes.BAD_REQUEST
      );
    }

    if (startNumber < 0 || endNumber < 0) {
      throw new AppError('Os números da rifa não podem ser negativos.', StatusCodes.BAD_REQUEST);
    }

    if (startNumber > endNumber) {
      throw new AppError(
        'O número inicial não pode ser maior que o número final.',
        StatusCodes.BAD_REQUEST
      );
    }
  }

  private validatePricePerNumber(pricePerNumber: number): void {
    if (!Number.isFinite(pricePerNumber) || pricePerNumber <= 0) {
      throw new AppError(
        'O valor por número da rifa deve ser maior que zero.',
        StatusCodes.BAD_REQUEST
      );
    }
  }

  private validateImageUrl(imageUrl: string): void {
    try {
      const url = new URL(imageUrl);

      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new AppError(
          'A URL da imagem deve usar protocolo HTTP ou HTTPS.',
          StatusCodes.BAD_REQUEST
        );
      }
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError('A URL da imagem da rifa é inválida.', StatusCodes.BAD_REQUEST);
    }
  }

  private normalizeRequiredText(value: string, message: string): string {
    const normalized = value.trim();

    if (!normalized) {
      throw new AppError(message, StatusCodes.BAD_REQUEST);
    }

    return normalized;
  }

  private normalizeOptionalText(value?: string): string | undefined {
    if (!value) return undefined;
    const normalized = value.trim();
    return normalized || undefined;
  }

  private normalizeFilters(filters?: RaffleFilters): RaffleFilters | undefined {
    if (!filters) return undefined;

    const { status, userId } = filters;

    if (userId) {
      this.validateUserId(userId);
    }

    if (!status && !userId) return undefined;

    const result: RaffleFilters = {};
    if (status) result.status = status;
    if (userId) result.userId = userId;

    return result;
  }
}
