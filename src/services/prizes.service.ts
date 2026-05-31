import { type CreatePrizeDTO, type UpdatePrizeDTO } from '@dtos/prize.dto';
import { type Prize } from '@entities/prize.entity';
import { PrizesRepository } from '@repositories/prizes.repository';
import { AppError } from '@shared/errors/app-error';
import { StatusCodes } from 'http-status-codes';

export class PrizesService {
  private readonly prizesRepository: PrizesRepository;

  constructor(repository = new PrizesRepository()) {
    this.prizesRepository = repository;
  }

  async create(data: CreatePrizeDTO): Promise<Prize> {
    this.validateId(data.raffleId, 'raffleId');
    const title = data.title?.trim();
    if (!title) {
      throw new AppError(`Campo "title" é obrigatório.`, StatusCodes.BAD_REQUEST);
    }
    return await this.prizesRepository.create({ ...data, title });
  }

  async findById(id: number): Promise<Prize> {
    this.validateId(id);
    const prize = await this.prizesRepository.findById(id);
    if (!prize) {
      throw new AppError('Prêmio não encontrado.', StatusCodes.NOT_FOUND);
    }
    return prize;
  }

  async findByRaffleId(raffleId: number): Promise<Prize[]> {
    this.validateId(raffleId, 'raffleId');
    return await this.prizesRepository.findByRaffleId(raffleId);
  }

  async update(id: number, data: UpdatePrizeDTO): Promise<Prize> {
    await this.findById(id);

    if (Object.keys(data).length === 0) {
      throw new AppError(
        'É necessário informar ao menos um campo para atualização.',
        StatusCodes.BAD_REQUEST
      );
    }

    if (data.title !== undefined) {
      data.title = data.title.trim();
      if (!data.title) {
        throw new AppError(`Campo "title" não pode ser vazio.`, StatusCodes.BAD_REQUEST);
      }
    }

    await this.prizesRepository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.prizesRepository.delete(id);
  }

  private validateId(id: number, field = 'id'): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(
        `${field === 'id' ? 'ID do prêmio' : 'ID da rifa'} inválido.`,
        StatusCodes.BAD_REQUEST
      );
    }
  }
}
