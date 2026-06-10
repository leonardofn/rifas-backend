import { AppDataSource } from '@config/data-source';
import {
  type CreateRafflePurchaseDTO,
  type UpdateRafflePurchaseDTO
} from '@dtos/raffle-purchase.dto';
import { RafflePurchase } from '@entities/raffle-purchase.entity';
import { type PaymentStatus } from '@shared/enums/payment-status';
import { executeInTransaction } from '@shared/typeorm/execute-in-transaction';
import { type DeepPartial, type Repository } from 'typeorm';

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

  async findById(id: number): Promise<RafflePurchase | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: { raffle: true, user: true }
    });
  }

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

  async update(id: number, data: UpdateRafflePurchaseDTO): Promise<void> {
    await this.ormRepository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async isNumberTakenInRaffle(raffleId: number, numberBought: number): Promise<boolean> {
    const count = await this.ormRepository.count({
      where: { raffleId, numberBought }
    });
    return count > 0;
  }
}
