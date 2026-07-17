import { AppDataSource } from '@config/data-source';
import type { PaginatedResponse } from '@dtos/pagination.dto';
import {
  type CreateRafflePurchaseDTO,
  type UpdateRafflePurchaseDTO
} from '@dtos/raffle-purchase.dto';
import { RafflePurchase } from '@entities/raffle-purchase.entity';
import { AppConstants } from '@shared/constants';
import { PaymentStatus } from '@shared/enums/payment-status';
import { runInTransaction } from '@shared/typeorm/run-in-transaction';
import { type DeepPartial, type DeleteResult, type Repository, type UpdateResult } from 'typeorm';

export class RafflePurchaseRepository {
  private readonly ormRepository: Repository<RafflePurchase>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(RafflePurchase);
  }

  /**
   * Cria e salva uma nova compra de rifa no banco de dados.
   */
  async create(data: CreateRafflePurchaseDTO): Promise<RafflePurchase> {
    return await runInTransaction(this.ormRepository, async manager => {
      const purchaseData: DeepPartial<RafflePurchase> = {
        raffle: { id: data.raffleId },
        user: { id: data.userId },
        numberBought: data.numberBought,
        amountPaid: data.amountPaid
      };

      const purchase = manager.create(RafflePurchase, purchaseData);
      return await manager.save(purchase);
    });
  }

  /**
   * Busca uma compra de rifa pelo seu ID interno.
   */
  async findById(id: number): Promise<RafflePurchase | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: { raffle: true, user: true }
    });
  }

  /**
   * Busca todas as compras de uma rifa pelo ID da rifa.
   */
  async findByRaffleId(
    raffleId: number,
    page: number = AppConstants.DEFAULT_PAGE,
    limit: number = AppConstants.DEFAULT_LIMIT,
    paymentStatus?: PaymentStatus
  ): Promise<PaginatedResponse<RafflePurchase>> {
    const query = this.ormRepository
      .createQueryBuilder('purchase')
      .where('purchase.raffle_id = :raffleId', { raffleId });

    if (paymentStatus) {
      query.andWhere('purchase.payment_status = :paymentStatus', { paymentStatus });
    }

    query.orderBy('purchase.purchase_datetime', 'DESC');

    query.skip((page - AppConstants.ONE) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      items: data,
      totalItems: total,
      itemCount: data.length,
      itemsPerPage: limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Busca todas as compras de um usuário pelo ID do usuário.
   */
  async findByUserId(
    userId: number,
    page: number = AppConstants.DEFAULT_PAGE,
    limit: number = AppConstants.DEFAULT_LIMIT,
    paymentStatus?: PaymentStatus
  ): Promise<PaginatedResponse<RafflePurchase>> {
    const query = this.ormRepository
      .createQueryBuilder('purchase')
      .where('purchase.user_id = :userId', { userId });

    if (paymentStatus) {
      query.andWhere('purchase.payment_status = :paymentStatus', { paymentStatus });
    }

    query.orderBy('purchase.purchase_datetime', 'DESC');

    query.skip((page - AppConstants.ONE) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      items: data,
      totalItems: total,
      itemCount: data.length,
      itemsPerPage: limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Atualiza uma compra de rifa pelo seu ID interno.
   */
  async update(id: number, data: UpdateRafflePurchaseDTO): Promise<UpdateResult> {
    return await runInTransaction(this.ormRepository, async manager => {
      return await manager.update(RafflePurchase, id, data);
    });
  }

  /**
   * Atualiza o status de pagamento de uma compra de rifa e sincroniza o total arrecadado da rifa.
   */
  async updatePaymentStatusWithRaffleSync(
    id: number,
    paymentStatus: PaymentStatus
  ): Promise<RafflePurchase | null> {
    return await runInTransaction(this.ormRepository, async manager => {
      const purchase = await manager
        .createQueryBuilder(RafflePurchase, 'purchase')
        .setLock('pessimistic_write') // evita condições de corrida ao atualizar o status de pagamento
        .where('purchase.id = :id', { id })
        .getOne();

      if (!purchase) {
        return null;
      }

      const previousStatus = purchase.paymentStatus;
      const amount = Number(purchase.amountPaid);

      await manager.update(RafflePurchase, id, { paymentStatus });

      let totalDelta = AppConstants.ZERO;

      if (previousStatus !== PaymentStatus.PAID && paymentStatus === PaymentStatus.PAID) {
        totalDelta = amount;
      } else if (
        previousStatus === PaymentStatus.PAID &&
        paymentStatus === PaymentStatus.CANCELLED
      ) {
        totalDelta = -amount;
      }

      if (totalDelta !== AppConstants.ZERO && purchase.raffleId) {
        await manager.query(
          `UPDATE raffles SET total_collected = GREATEST(${AppConstants.ZERO}, total_collected + $1) WHERE id = $2`,
          [totalDelta, purchase.raffleId]
        );
      }

      return await manager.findOne(RafflePurchase, {
        where: { id },
        relations: { raffle: true, user: true }
      });
    });
  }

  /**
   * Exclui uma compra de rifa pelo seu ID interno.
   */
  async delete(id: number): Promise<DeleteResult> {
    return await runInTransaction(this.ormRepository, async manager => {
      return await manager.delete(RafflePurchase, { id });
    });
  }

  /**
   * Verifica se um número já foi comprado em uma rifa específica.
   */
  async isNumberTakenInRaffle(raffleId: number, numberBought: number): Promise<boolean> {
    const count = await this.ormRepository.count({
      where: { raffleId, numberBought }
    });
    return count > AppConstants.ZERO;
  }
}
