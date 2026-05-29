import { type CreateRaffleDTO, type UpdateRaffleDTO } from '@dtos/raffle.dto';
import { type Raffle } from '@entities/raffle.entity';
import { RaffleRepository } from '@repositories/raffles.repository';
import { RaffleStatus } from '@shared/enums/ruffle-status';
import { AppError } from '@shared/errors/app-error';

type RaffleFilters = { status?: RaffleStatus; userId?: number };
type PaginatedRaffles = { data: Raffle[]; total: number; currentPage: number };

export class RafflesService {
  private readonly rafflesRepository: RaffleRepository;

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

  private static readonly NON_EDITABLE_STATUSES = new Set<RaffleStatus>([
    RaffleStatus.DRAWN,
    RaffleStatus.CLOSED,
    RaffleStatus.CANCELLED
  ]);

  private static readonly DELETABLE_STATUSES = new Set<RaffleStatus>([
    RaffleStatus.PENDING,
    RaffleStatus.CANCELLED
  ]);

  constructor(repository = new RaffleRepository()) {
    this.rafflesRepository = repository;
  }

  async create(data: CreateRaffleDTO): Promise<Raffle> {
    return await this.rafflesRepository.create(this.sanitizeCreateData(data));
  }

  async findById(id: number): Promise<Raffle> {
    this.validateId(id);

    const raffle = await this.rafflesRepository.findById(id);

    if (!raffle) {
      throw new AppError('Rifa não encontrada.', 404);
    }

    return raffle;
  }

  async findByPublicId(publicId: string): Promise<Raffle> {
    const trimmed = publicId.trim();

    if (!trimmed) {
      throw new AppError('Public ID da rifa é obrigatório.', 400);
    }

    const raffle = await this.rafflesRepository.findByPublicId(trimmed);

    if (!raffle) {
      throw new AppError('Rifa não encontrada.', 404);
    }

    return raffle;
  }

  async findPaginated(page = 1, limit = 10, filters?: RaffleFilters): Promise<PaginatedRaffles> {
    this.validatePagination(page, limit);
    return await this.rafflesRepository.findPaginated(page, limit, this.normalizeFilters(filters));
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

    await this.rafflesRepository.changeStatus(id, newStatus);

    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const raffle = await this.findById(id);

    if (!RafflesService.DELETABLE_STATUSES.has(raffle.status)) {
      throw new AppError('Só é permitido excluir rifas pendentes ou canceladas.', 409, {
        currentStatus: raffle.status
      });
    }

    await this.rafflesRepository.delete(id);
  }

  async incrementTotalCollected(id: number, amount: number): Promise<Raffle> {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new AppError(
        'O valor para incrementar o total arrecadado deve ser maior que zero.',
        400
      );
    }

    const raffle = await this.findById(id);

    if (raffle.status !== RaffleStatus.OPEN) {
      throw new AppError('Só é permitido arrecadar em rifas abertas.', 409, {
        currentStatus: raffle.status
      });
    }

    await this.rafflesRepository.incrementTotalCollected(id, amount);

    return await this.findById(id);
  }

  private validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError('ID da rifa inválido.', 400);
    }
  }

  private validatePagination(page: number, limit: number): void {
    if (!Number.isInteger(page) || page <= 0) {
      throw new AppError('Parâmetro "page" deve ser um número inteiro maior que zero.', 400);
    }

    if (!Number.isInteger(limit) || limit <= 0 || limit > RafflesService.PAGINATION_MAX_LIMIT) {
      throw new AppError(
        `Parâmetro "limit" deve ser um número inteiro entre 1 e ${RafflesService.PAGINATION_MAX_LIMIT}.`,
        400
      );
    }
  }

  private sanitizeCreateData(data: CreateRaffleDTO): CreateRaffleDTO {
    this.validateUserId(data.userId);
    this.validateNumbersRange(data.startNumber, data.endNumber);
    this.validatePricePerNumber(data.pricePerNumber);

    const description = this.normalizeOptionalText(data.description);
    const imageUrl = this.normalizeOptionalText(data.imageUrl);

    if (imageUrl) {
      this.validateImageUrl(imageUrl);
    }

    const sanitized: CreateRaffleDTO = {
      userId: data.userId,
      title: this.normalizeRequiredText(data.title, 'Título da rifa é obrigatório.'),
      startNumber: data.startNumber,
      endNumber: data.endNumber,
      pricePerNumber: data.pricePerNumber
    };

    if (description !== undefined) sanitized.description = description;
    if (imageUrl !== undefined) sanitized.imageUrl = imageUrl;

    return sanitized;
  }

  private sanitizeUpdateData(data: UpdateRaffleDTO): UpdateRaffleDTO {
    if (Object.keys(data).length === 0) {
      throw new AppError('É necessário informar ao menos um campo para atualização.', 400);
    }

    if (data.status !== undefined) {
      throw new AppError(
        'Use o método de alteração de status para atualizar o status da rifa.',
        400
      );
    }

    const sanitized: UpdateRaffleDTO = {};

    if (data.title !== undefined) {
      sanitized.title = this.normalizeRequiredText(data.title, 'Título da rifa é obrigatório.');
    }

    if (data.description !== undefined) {
      sanitized.description = this.normalizeOptionalText(data.description) ?? '';
    }

    if (data.imageUrl !== undefined) {
      const imageUrl = this.normalizeOptionalText(data.imageUrl) ?? '';

      if (imageUrl) {
        this.validateImageUrl(imageUrl);
      }

      sanitized.imageUrl = imageUrl;
    }

    if (Object.keys(sanitized).length === 0) {
      throw new AppError('Não há campos válidos para atualização.', 400);
    }

    return sanitized;
  }

  private ensureAllowedStatusTransition(
    currentStatus: RaffleStatus,
    nextStatus: RaffleStatus
  ): void {
    const allowedTransitions = RafflesService.ALLOWED_STATUS_TRANSITIONS[currentStatus];

    if (!allowedTransitions.includes(nextStatus)) {
      throw new AppError('Transição de status inválida para a rifa.', 409, {
        currentStatus,
        nextStatus,
        allowedTransitions
      });
    }
  }

  private ensureRaffleIsEditable(status: RaffleStatus): void {
    if (RafflesService.NON_EDITABLE_STATUSES.has(status)) {
      throw new AppError('Não é permitido editar rifas sorteadas, encerradas ou canceladas.', 409, {
        currentStatus: status
      });
    }
  }

  private validateUserId(userId: number): void {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new AppError('O ID do usuário da rifa é inválido.', 400);
    }
  }

  private validateNumbersRange(startNumber: number, endNumber: number): void {
    if (!Number.isInteger(startNumber) || !Number.isInteger(endNumber)) {
      throw new AppError('Os números inicial e final da rifa devem ser inteiros.', 400);
    }

    if (startNumber < 0 || endNumber < 0) {
      throw new AppError('Os números da rifa não podem ser negativos.', 400);
    }

    if (startNumber > endNumber) {
      throw new AppError('O número inicial não pode ser maior que o número final.', 400);
    }
  }

  private validatePricePerNumber(pricePerNumber: number): void {
    if (!Number.isFinite(pricePerNumber) || pricePerNumber <= 0) {
      throw new AppError('O valor por número da rifa deve ser maior que zero.', 400);
    }
  }

  private validateImageUrl(imageUrl: string): void {
    try {
      const url = new URL(imageUrl);

      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new AppError('A URL da imagem deve usar protocolo HTTP ou HTTPS.', 400);
      }
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError('A URL da imagem da rifa é inválida.', 400);
    }
  }

  private normalizeRequiredText(value: string, message: string): string {
    const normalized = value.trim();

    if (!normalized) {
      throw new AppError(message, 400);
    }

    return normalized;
  }

  private normalizeOptionalText(value?: string): string | undefined {
    if (value === undefined) return undefined;
    const normalized = value.trim();
    return normalized || undefined;
  }

  private normalizeFilters(filters?: RaffleFilters): RaffleFilters | undefined {
    if (!filters) return undefined;

    const { status, userId } = filters;

    if (userId !== undefined) {
      this.validateUserId(userId);
    }

    if (status === undefined && userId === undefined) return undefined;

    const result: RaffleFilters = {};
    if (status !== undefined) result.status = status;
    if (userId !== undefined) result.userId = userId;

    return result;
  }
}
