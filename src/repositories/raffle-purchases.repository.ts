import { AppDataSource } from '@config/data-source';
import {
  type CreateRafflePurchaseDTO,
  type UpdateRafflePurchaseDTO
} from '@dtos/raffle-purchase.dto';
import { RafflePurchase } from '@entities/raffle-purchase.entity';
import { PaymentStatus } from '@shared/enums/payment-status';
import { executeInTransaction } from '@shared/typeorm/execute-in-transaction';
import { type DeepPartial, type DeleteResult, type Repository, type UpdateResult } from 'typeorm';

interface IPaginatedPurchases<T> {
  data: T[];
  total: number;
  currentPage: number;
}

export class RafflePurchaseRepository {
  private readonly ormRepository: Repository<RafflePurchase>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(RafflePurchase);
  }

  /**
   * Cria e salva uma nova compra de rifa no banco de dados.
   */
  async create(data: CreateRafflePurchaseDTO): Promise<RafflePurchase> {
    return await executeInTransaction(this.ormRepository, async manager => {
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
    page: number = 1,
    limit: number = 10,
    paymentStatus?: PaymentStatus
  ): Promise<IPaginatedPurchases<RafflePurchase>> {
    const query = this.ormRepository
      .createQueryBuilder('purchase')
      .where('purchase.raffle_id = :raffleId', { raffleId });

    if (paymentStatus) {
      query.andWhere('purchase.payment_status = :paymentStatus', { paymentStatus });
    }

    query.orderBy('purchase.purchase_datetime', 'DESC');

    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total, currentPage: page };
  }

  /**
   * Busca todas as compras de um usuário pelo ID do usuário.
   */
  async findByUserId(
    userId: number,
    page: number = 1,
    limit: number = 10,
    paymentStatus?: PaymentStatus
  ): Promise<IPaginatedPurchases<RafflePurchase>> {
    const query = this.ormRepository
      .createQueryBuilder('purchase')
      .where('purchase.user_id = :userId', { userId });

    if (paymentStatus) {
      query.andWhere('purchase.payment_status = :paymentStatus', { paymentStatus });
    }

    query.orderBy('purchase.purchase_datetime', 'DESC');

    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total, currentPage: page };
  }

  /**
   * Atualiza uma compra de rifa pelo seu ID interno.
   */
  async update(id: number, data: UpdateRafflePurchaseDTO): Promise<UpdateResult> {
    return await executeInTransaction(this.ormRepository, async manager => {
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
    return await executeInTransaction(this.ormRepository, async manager => {
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

      let totalDelta = 0;

      if (previousStatus !== PaymentStatus.PAID && paymentStatus === PaymentStatus.PAID) {
        totalDelta = amount;
      } else if (
        previousStatus === PaymentStatus.PAID &&
        paymentStatus === PaymentStatus.CANCELLED
      ) {
        totalDelta = -amount;
      }

      if (totalDelta !== 0 && purchase.raffleId) {
        await manager.query(
          'UPDATE raffles SET total_collected = GREATEST(0, total_collected + $1) WHERE id = $2',
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
    return await executeInTransaction(this.ormRepository, async manager => {
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
    return count > 0;
  }
}
