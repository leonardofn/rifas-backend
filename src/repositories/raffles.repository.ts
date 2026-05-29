// src/repositories/RaffleRepository.ts

import { AppDataSource } from '@/config/data-source';
import { type CreateRaffleDTO, type UpdateRaffleDTO } from '@dtos/raffle.dto';
import { Raffle } from '@entities/raffle.entity';
import { RaffleStatus } from '@shared/enums/ruffle-status';
import { executeInTransaction } from '@shared/typeorm/execute-in-transaction';
import { type DeepPartial, type DeleteResult, type Repository, type UpdateResult } from 'typeorm';

export class RaffleRepository {
  private readonly ormRepository: Repository<Raffle>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Raffle);
  }

  /**
   * Cria e salva uma nova rifa no banco de dados.
   */
  async create(data: CreateRaffleDTO): Promise<Raffle> {
    return await executeInTransaction(this.ormRepository, async manager => {
      const raffleData: DeepPartial<Raffle> = {
        user: { id: data.userId }, // Relação com o usuário criador
        title: data.title,
        startNumber: data.startNumber,
        endNumber: data.endNumber,
        pricePerNumber: data.pricePerNumber,
        status: RaffleStatus.PENDING // Valor default definido no BD
      };

      raffleData.description = data.description ?? null;
      raffleData.imageUrl = data.imageUrl ?? null;

      const raffle = manager.create(Raffle, raffleData);

      return await manager.save(raffle);
    });
  }

  /**
   * Busca uma rifa pelo seu ID interno (Chave Primária).
   */
  async findById(id: number): Promise<Raffle | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: { user: true } // Traz os dados do dono da rifa (opcional, dependendo do caso de uso)
    });
  }

  /**
   * Busca uma rifa pelo Public ID (Ideal para rotas públicas e URLs).
   */
  async findByPublicId(publicId: string): Promise<Raffle | null> {
    return await this.ormRepository.findOne({
      where: { publicId }
    });
  }

  /**
   * Lista rifas com paginação e filtros opcionais.
   * Uso de QueryBuilder para melhor performance e consultas complexas.
   */
  async findPaginated(
    page: number = 1,
    limit: number = 10,
    filters?: { status?: RaffleStatus; userId?: number }
  ): Promise<{ data: Raffle[]; total: number; currentPage: number }> {
    const query = this.ormRepository.createQueryBuilder('raffle');

    if (filters?.status) {
      query.andWhere('raffle.status = :status', { status: filters.status });
    }

    if (filters?.userId) {
      query.andWhere('raffle.user_id = :userId', { userId: filters.userId });
    }

    // Paginação
    query.skip((page - 1) * limit).take(limit);

    // Ordenar pelas mais recentes
    query.orderBy('raffle.created_at', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      currentPage: page
    };
  }

  /**
   * Atualiza os dados de uma rifa.
   */
  async update(id: number, data: UpdateRaffleDTO): Promise<UpdateResult> {
    return await executeInTransaction(this.ormRepository, async manager => {
      return await manager.update(Raffle, id, data);
    });
  }

  /**
   * Atualiza o status da rifa isoladamente.
   */
  async changeStatus(id: number, status: RaffleStatus): Promise<UpdateResult> {
    return await executeInTransaction(this.ormRepository, async manager => {
      return await manager.update(Raffle, id, { status });
    });
  }

  /**
   * Exclui uma rifa pelo seu ID interno.
   */
  async delete(id: number): Promise<DeleteResult> {
    return await executeInTransaction(this.ormRepository, async manager => {
      return await manager.delete(Raffle, { id });
    });
  }

  /**
   * Lista todas as rifas de um determinado usuário.
   */
  async findByUserId(userId: number): Promise<Raffle[]> {
    return await this.ormRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Incrementa o valor total arrecadado de forma ATÔMICA.
   * Evita condição de corrida (Race Condition) ao atualizar saldos.
   */
  async incrementTotalCollected(id: number, amount: number): Promise<void> {
    await executeInTransaction(this.ormRepository, async manager => {
      await manager
        .createQueryBuilder()
        .update(Raffle)
        .set({
          totalCollected: () => `total_collected + ${amount}`
        })
        .where('id = :id', { id })
        .execute();
    });
  }
}
