import {
  type CreateRafflePurchaseDTO,
  type UpdateRafflePurchaseDTO
} from '@dtos/raffle-purchase.dto';
import { type RafflePurchase } from '@entities/raffle-purchase.entity';
import { RafflePurchaseRepository } from '@repositories/raffle-purchases.repository';
import { RaffleRepository } from '@repositories/raffles.repository';
import { RaffleStatus } from '@shared/enums/ruffle-status';
import { AppError } from '@shared/errors/app-error';
import { type IPurchasePaginationOptions } from '@shared/interfaces/pagination.interface';
import { StatusCodes } from 'http-status-codes';

interface IPaginatedPurchases {
  data: RafflePurchase[];
  total: number;
  currentPage: number;
}

export class RafflePurchasesService {
  private readonly purchasesRepository: RafflePurchaseRepository;
  private readonly rafflesRepository: RaffleRepository;

  private static readonly PAGINATION_MAX_LIMIT = 100;

  constructor(
    purchasesRepository = new RafflePurchaseRepository(),
    rafflesRepository = new RaffleRepository()
  ) {
    this.purchasesRepository = purchasesRepository;
    this.rafflesRepository = rafflesRepository;
  }

  async create(data: CreateRafflePurchaseDTO): Promise<RafflePurchase> {
    const raffle = await this.rafflesRepository.findById(data.raffleId);

    if (!raffle) {
      throw new AppError('Rifa não encontrada.', StatusCodes.NOT_FOUND);
    }

    if (raffle.status !== RaffleStatus.OPEN) {
      throw new AppError(
        'Não é possível comprar números de uma rifa que não está aberta.',
        StatusCodes.UNPROCESSABLE_ENTITY
      );
    }

    if (data.numberBought < raffle.startNumber || data.numberBought > raffle.endNumber) {
      throw new AppError(
        `O número ${data.numberBought} está fora do intervalo permitido (${raffle.startNumber} - ${raffle.endNumber}).`,
        StatusCodes.BAD_REQUEST
      );
    }

    // Verifica se o número já foi comprado para essa rifa
    const isTaken = await this.purchasesRepository.isNumberTakenInRaffle(
      data.raffleId,
      data.numberBought
    );

    if (isTaken) {
      throw new AppError(
        `O número ${data.numberBought} já foi reservado nesta rifa.`,
        StatusCodes.CONFLICT
      );
    }

    return await this.purchasesRepository.create(data);
  }

  async findById(id: number): Promise<RafflePurchase> {
    this.validateId(id);

    const purchase = await this.purchasesRepository.findById(id);

    if (!purchase) {
      throw new AppError('Compra não encontrada.', StatusCodes.NOT_FOUND);
    }

    return purchase;
  }

  async findByRaffleId(
    raffleId: number,
    options: IPurchasePaginationOptions
  ): Promise<IPaginatedPurchases> {
    const { page = 1, limit = 10, paymentStatus } = options;

    this.validateId(raffleId);
    this.validatePagination(page, limit);

    const raffle = await this.rafflesRepository.findById(raffleId);
    if (!raffle) {
      throw new AppError('Rifa não encontrada.', StatusCodes.NOT_FOUND);
    }

    return await this.purchasesRepository.findByRaffleId(raffleId, page, limit, paymentStatus);
  }

  async findByUserId(
    userId: number,
    options: IPurchasePaginationOptions
  ): Promise<IPaginatedPurchases> {
    const { page = 1, limit = 10, paymentStatus } = options;

    this.validateId(userId);
    this.validatePagination(page, limit);

    return await this.purchasesRepository.findByUserId(userId, page, limit, paymentStatus);
  }

  async updatePaymentStatus(id: number, data: UpdateRafflePurchaseDTO): Promise<RafflePurchase> {
    const purchase = await this.findById(id);

    if (!data.paymentStatus) {
      throw new AppError('Status de pagamento é obrigatório.', StatusCodes.BAD_REQUEST);
    }

    if (purchase.paymentStatus === data.paymentStatus) {
      throw new AppError(
        `A compra já está com o status "${data.paymentStatus}".`,
        StatusCodes.CONFLICT
      );
    }

    const updatedPurchase = await this.purchasesRepository.updatePaymentStatusWithRaffleSync(
      id,
      data.paymentStatus
    );

    if (!updatedPurchase) {
      throw new AppError('Compra não encontrada.', StatusCodes.NOT_FOUND);
    }

    return updatedPurchase;
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.purchasesRepository.delete(id);
  }

  private validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError('ID inválido.', StatusCodes.BAD_REQUEST);
    }
  }

  private validatePagination(page: number, limit: number): void {
    if (page < 1) {
      throw new AppError('Página deve ser maior ou igual a 1.', StatusCodes.BAD_REQUEST);
    }

    if (limit < 1 || limit > RafflePurchasesService.PAGINATION_MAX_LIMIT) {
      throw new AppError(
        `Limite deve ser entre 1 e ${RafflePurchasesService.PAGINATION_MAX_LIMIT}.`,
        StatusCodes.BAD_REQUEST
      );
    }
  }
}
