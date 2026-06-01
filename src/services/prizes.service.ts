import { type CreatePrizeDTO, type UpdatePrizeDTO } from '@dtos/prize.dto';
import { type Prize } from '@entities/prize.entity';
import { PrizesRepository } from '@repositories/prizes.repository';
import { RaffleRepository } from '@repositories/raffles.repository';
import { RaffleStatus } from '@shared/enums/ruffle-status';
import { AppError } from '@shared/errors/app-error';
import { StatusCodes } from 'http-status-codes';
import { UpdateResult } from 'typeorm';

export class PrizesService {
  private readonly prizesRepository: PrizesRepository;
  private readonly raffleRepository: RaffleRepository;
  private readonly MAX_PRIZES_LIMIT = 3;

  constructor(
    prizesRepository = new PrizesRepository(),
    raffleRepository = new RaffleRepository()
  ) {
    this.prizesRepository = prizesRepository;
    this.raffleRepository = raffleRepository;
  }

  async create(data: CreatePrizeDTO): Promise<Prize> {
    const raffleId = data.raffleId;

    // Valida o ID da rifa
    this.validateId(raffleId, 'raffleId');

    // Valida o título do prêmio
    const title = data.title?.trim();
    if (!title) {
      throw new AppError(`Campo "title" é obrigatório.`, StatusCodes.BAD_REQUEST);
    }

    // Verifica se a rifa existe e está no status PENDING
    const foundRaffle = await this.raffleRepository.findById(raffleId);
    if (!foundRaffle) {
      throw new AppError(`Rifa com ID ${raffleId} não encontrada.`, StatusCodes.NOT_FOUND);
    }

    // Permite adicionar prêmios apenas a rifas que estejam no status PENDING
    if (foundRaffle.status !== RaffleStatus.PENDING) {
      throw new AppError(
        `Não é permitido adicionar prêmios a rifas que não estejam no status pendente.`,
        StatusCodes.BAD_REQUEST
      );
    }

    const totalPrizes = await this.prizesRepository.findByRaffleId(raffleId);

    // Limita a 3 o número de prêmios por rifa
    if (totalPrizes.length >= this.MAX_PRIZES_LIMIT) {
      throw new AppError(
        `Não é permitido adicionar mais de ${this.MAX_PRIZES_LIMIT} prêmios a uma rifa.`,
        StatusCodes.BAD_REQUEST
      );
    }

    const prizeOrder = totalPrizes.length + 1;

    return await this.prizesRepository.create({ ...data, title, prizeOrder });
  }

  async findById(id: number): Promise<Prize> {
    // Valida o ID do prêmio
    this.validateId(id);

    // Busca o prêmio pelo ID
    const prize = await this.prizesRepository.findById(id);
    if (!prize) {
      throw new AppError('Prêmio não encontrado.', StatusCodes.NOT_FOUND);
    }

    return prize;
  }

  async findByRaffleId(raffleId: number): Promise<Prize[]> {
    this.validateId(raffleId, 'raffleId');

    // Verifica se a rifa existe antes de buscar os prêmios
    const foundRaffle = await this.raffleRepository.findById(raffleId);
    if (!foundRaffle) {
      throw new AppError(`Rifa com ID ${raffleId} não encontrada.`, StatusCodes.NOT_FOUND);
    }

    return await this.prizesRepository.findByRaffleId(raffleId);
  }

  async update(id: number, data: UpdatePrizeDTO): Promise<Prize> {
    const prize = await this.findById(id);

    // Permite editar prêmios apenas de rifas que estejam no status PENDING
    if (!prize.raffle || prize.raffle.status !== RaffleStatus.PENDING) {
      throw new AppError(
        `Não é permitido editar prêmios de rifas que não estejam no status pendente.`,
        StatusCodes.BAD_REQUEST
      );
    }

    // Valida os campos fornecidos para atualização
    if (Object.keys(data).length === 0) {
      throw new AppError(
        'É necessário informar ao menos um campo para atualização.',
        StatusCodes.BAD_REQUEST
      );
    }

    // Se o título for fornecido, valida que ele não seja vazio após trim
    if (data.title) {
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

    // Permite remover prêmios apenas de rifas que estejam no status PENDING
    if (!prize.raffle || prize.raffle.status !== RaffleStatus.PENDING) {
      throw new AppError(
        `Não é permitido remover prêmios de rifas que não estejam no status pendente.`,
        StatusCodes.BAD_REQUEST
      );
    }

    await this.prizesRepository.delete(id);

    // Após remover o prêmio, atualiza a ordem dos prêmios restantes para garantir que estejam sequenciais
    const remainingPrizes = await this.prizesRepository.findByRaffleId(prize.raffle.id);
    const updatePrizeOrderTasks = remainingPrizes.map((remaining, index) => {
      if (remaining.prizeOrder !== index + 1) {
        return this.prizesRepository.update(remaining.id, { prizeOrder: index + 1 });
      }
      return Promise.resolve(new UpdateResult());
    });

    await Promise.all(updatePrizeOrderTasks);
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
