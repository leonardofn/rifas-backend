import { AppDataSource } from '@/config/data-source';
import { type CreatePrizeDTO, type UpdatePrizeDTO } from '@dtos/prize.dto';
import { Prize } from '@entities/prize.entity';
import { executeInTransaction } from '@shared/typeorm/execute-in-transaction';
import { type DeepPartial, type DeleteResult, type Repository, type UpdateResult } from 'typeorm';

export class PrizesRepository {
  private readonly ormRepository: Repository<Prize>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Prize);
  }

  async create(data: CreatePrizeDTO): Promise<Prize> {
    return await executeInTransaction(this.ormRepository, async manager => {
      const prizeData: DeepPartial<Prize> = {
        raffle: { id: data.raffleId },
        title: data.title,
        description: data.description ?? null,
        imageUrl: data.imageUrl ?? null,
        prizeOrder: data.prizeOrder ?? 1,
        value: data.value ?? null
      };

      const prize = manager.create(Prize, prizeData);
      return await manager.save(prize);
    });
  }

  async findById(id: number): Promise<Prize | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: { raffle: true }
    });
  }

  async findByRaffleId(raffleId: number): Promise<Prize[]> {
    return await this.ormRepository.find({
      where: { raffle: { id: raffleId } },
      order: { prizeOrder: 'ASC' }
    });
  }

  async update(id: number, data: UpdatePrizeDTO): Promise<UpdateResult> {
    return await executeInTransaction(this.ormRepository, async manager => {
      return await manager.update(Prize, id, data);
    });
  }

  async delete(id: number): Promise<DeleteResult> {
    return await executeInTransaction(this.ormRepository, async manager => {
      return await manager.delete(Prize, { id });
    });
  }
}
