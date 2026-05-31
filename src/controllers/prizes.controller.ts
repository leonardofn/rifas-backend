import { type CreatePrizeDTO, type UpdatePrizeDTO } from '@dtos/prize.dto';
import { PrizesService } from '@services/prizes.service';
import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class PrizesController {
  private readonly prizesService: PrizesService;

  constructor(service = new PrizesService()) {
    this.prizesService = service;
  }

  /**
   * POST /prizes
   */
  create = async (req: Request, res: Response): Promise<void> => {
    const prizeData = req.body as CreatePrizeDTO;
    const prize = await this.prizesService.create(prizeData);
    res.status(StatusCodes.CREATED).json(prize);
  };

  /**
   * GET /prizes/raffle/:raffleId
   */
  findByRaffleId = async (req: Request, res: Response): Promise<void> => {
    const raffleId = Number(req.params['raffleId']);
    const prizes = await this.prizesService.findByRaffleId(raffleId);
    res.status(StatusCodes.OK).json(prizes);
  };

  /**
   * GET /prizes/:id
   */
  findById = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params['id']);
    const prize = await this.prizesService.findById(id);
    res.status(StatusCodes.OK).json(prize);
  };

  /**
   * PUT /prizes/:id
   */
  update = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params['id']);
    const data = req.body as UpdatePrizeDTO;
    const prize = await this.prizesService.update(id, data);
    res.status(StatusCodes.OK).json(prize);
  };

  /**
   * DELETE /prizes/:id
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params['id']);
    await this.prizesService.delete(id);
    res.status(StatusCodes.NO_CONTENT).send();
  };
}
