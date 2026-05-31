import { type CreatePrizeDTO, type UpdatePrizeDTO } from '@dtos/prize.dto';
import { type Prize } from '@entities/prize.entity';
import { PrizesRepository } from '@repositories/prizes.repository';
import { RaffleRepository } from '@repositories/raffles.repository';
import { RaffleStatus } from '@shared/enums/ruffle-status';
import { AppError } from '@shared/errors/app-error';
import { StatusCodes } from 'http-status-codes';

export class PrizesService {
  private readonly prizesRepository: PrizesRepository;
  private readonly raffleRepository: RaffleRepository;

  constructor(
    prizesRepository = new PrizesRepository(),
    raffleRepository = new RaffleRepository()
  ) {
    this.prizesRepository = prizesRepository;
    this.raffleRepository = raffleRepository;
  }

  async create(data: CreatePrizeDTO): Promise<Prize> {
    const raffleId = data.raffleId;
    this.validateId(raffleId, 'raffleId');

    const title = data.title?.trim();
    if (!title) {
      throw new AppError(`Campo "title" é obrigatório.`, StatusCodes.BAD_REQUEST);
    }

    const foundRaffle = await this.raffleRepository.findById(raffleId);
    if (!foundRaffle) {
      throw new AppError(`Rifa com ID ${raffleId} não encontrada.`, StatusCodes.NOT_FOUND);
    }

    if (foundRaffle.status !== RaffleStatus.PENDING) {
      throw new AppError(
        `Não é permitido adicionar prêmios a rifas que não estejam no status pendente.`,
        StatusCodes.BAD_REQUEST
      );
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

    const foundRaffle = await this.raffleRepository.findById(raffleId);
    if (!foundRaffle) {
      throw new AppError(`Rifa com ID ${raffleId} não encontrada.`, StatusCodes.NOT_FOUND);
    }

    return await this.prizesRepository.findByRaffleId(raffleId);
  }

  async update(id: number, data: UpdatePrizeDTO): Promise<Prize> {
    const prize = await this.findById(id);

    if (!prize.raffle || prize.raffle.status !== RaffleStatus.PENDING) {
      throw new AppError(
        `Não é permitido editar prêmios de rifas que não estejam no status pendente.`,
        StatusCodes.BAD_REQUEST
      );
    }

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
    const prize = await this.findById(id);

    if (!prize.raffle || prize.raffle.status !== RaffleStatus.PENDING) {
      throw new AppError(
        `Não é permitido remover prêmios de rifas que não estejam no status pendente.`,
        StatusCodes.BAD_REQUEST
      );
    }

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
