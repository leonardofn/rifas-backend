// src/repositories/RaffleRepository.ts

import { AppDataSource } from '@config/data-source';
import { type PaginatedResponse } from '@dtos/pagination.dto';
import {
  type CreateRaffleDTO,
  type TrendingRaffleDTO,
  type UpdateRaffleDTO
} from '@dtos/raffle.dto';
import { Raffle } from '@entities/raffle.entity';
import { RaffleStatus } from '@shared/enums/ruffle-status';
import { runInTransaction } from '@shared/typeorm/run-in-transaction';
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
    return await runInTransaction(this.ormRepository, async manager => {
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
      raffleData.drawDate = data.drawDate ?? null;

      const raffle = manager.create(Raffle, raffleData);

      return await manager.save(raffle);
    });
  }

  /**
   * Busca uma rifa pelo seu ID interno
   */
  async findById(id: number): Promise<Raffle | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: { user: true, prizes: true }
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
    limit: number = 12,
    filters?: { status?: RaffleStatus; userId?: number }
  ): Promise<PaginatedResponse<Raffle>> {
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
      items: data,
      totalItems: total,
      itemCount: data.length,
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findTrendingRafflesPaginated(
    page: number = 1,
    limit: number = 12
  ): Promise<PaginatedResponse<TrendingRaffleDTO>> {
    // Calcula quantos itens devemos pular
    const offset = (page - 1) * limit;

    // QUERY DE DADOS (Com LIMIT e OFFSET)
    // O TypeORM substitui $1 e $2 pelos parâmetros passados no array
    const dataSql = `
      SELECT
        r.id,
        r.public_id,
        r.title,
        r.draw_date,
        r.total_collected,
        COUNT(rp.id) FILTER (WHERE rp.payment_status = 'paid') AS paid_tickets,
        (r.end_number - r.start_number + 1) AS total_tickets,
        COALESCE(
          COUNT(rp.id) FILTER (WHERE rp.payment_status = 'paid')::numeric
          / NULLIF((r.end_number - r.start_number + 1), 0),
          0
        ) AS sold_ratio,
        (
          0.60 * COALESCE(
            COUNT(rp.id) FILTER (WHERE rp.payment_status = 'paid')::numeric
            / NULLIF((r.end_number - r.start_number + 1), 0),
            0
          )
          + 0.25 * LEAST(r.total_collected / 10000.0, 1.0)
          + 0.15 * (1.0 / (1 + EXTRACT(EPOCH FROM (r.draw_date - NOW())) / 86400.0))
        ) AS highlight_score
      FROM raffles r
      LEFT JOIN raffle_purchases rp ON rp.raffle_id = r.id
      WHERE r.status = 'open'
        AND r.draw_date IS NOT NULL
        AND r.draw_date > NOW()
        AND EXISTS (SELECT 1 FROM prizes p WHERE p.raffle_id = r.id)
      GROUP BY r.id
      ORDER BY highlight_score DESC, r.created_at DESC
      LIMIT $1 OFFSET $2;
    `;

    // QUERY DE CONTAGEM TOTAL
    // Não faz LEFT JOIN nem matemática, apenas conta quantas rifas válidas existem
    const countSql = `
      SELECT COUNT(1) AS total
      FROM raffles r
      WHERE r.status = 'open'
        AND r.draw_date IS NOT NULL
        AND r.draw_date > NOW()
        AND EXISTS (SELECT 1 FROM prizes p WHERE p.raffle_id = r.id);
    `;

    // Executa ambas as queries ao mesmo tempo para ganhar tempo
    const [rawResults, countResult] = await Promise.all([
      this.ormRepository.query(dataSql, [limit, offset]),
      this.ormRepository.query(countSql)
    ]);

    const totalItems = parseInt(countResult[0].total || 0, 10);
    const totalPages = Math.ceil(totalItems / limit);

    // Mapeia e converte os dados do Postgres
    const mappedData: TrendingRaffleDTO[] = rawResults.map(
      (row: Record<string, unknown>): TrendingRaffleDTO => ({
        id: Number(row.id),
        publicId: row.public_id as string,
        title: row.title as string,
        drawDate: row.draw_date as Date,
        totalCollected: parseFloat((row.total_collected as string) || '0'),
        paidTickets: parseInt((row.paid_tickets as string) || '0', 10),
        totalTickets: parseInt((row.total_tickets as string) || '0', 10),
        soldRatio: parseFloat((row.sold_ratio as string) || '0'),
        highlightScore: parseFloat((row.highlight_score as string) || '0')
      })
    );

    // Retorna o formato paginado
    return {
      items: mappedData,
      totalItems,
      itemCount: mappedData.length,
      itemsPerPage: limit,
      currentPage: page,
      totalPages
    };
  }

  /**
   * Atualiza os dados de uma rifa.
   */
  async update(id: number, data: UpdateRaffleDTO): Promise<UpdateResult> {
    return await runInTransaction(this.ormRepository, async manager => {
      return await manager.update(Raffle, id, data);
    });
  }

  /**
   * Atualiza o status da rifa isoladamente.
   */
  async changeStatus(id: number, status: RaffleStatus): Promise<UpdateResult> {
    return await runInTransaction(this.ormRepository, async manager => {
      return await manager.update(Raffle, id, { status });
    });
  }

  /**
   * Exclui uma rifa pelo seu ID interno.
   */
  async delete(id: number): Promise<DeleteResult> {
    return await runInTransaction(this.ormRepository, async manager => {
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
    await runInTransaction(this.ormRepository, async manager => {
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
