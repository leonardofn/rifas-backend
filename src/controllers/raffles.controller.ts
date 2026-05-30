import { RafflesService } from '@services/raffles.service';
import type { RaffleStatus } from '@shared/enums/ruffle-status';
import type { Request, Response } from 'express';

import { type CreateRaffleDTO, type UpdateRaffleDTO } from '@dtos/raffle.dto';

export class RafflesController {
  private readonly rafflesService: RafflesService;

  constructor(service = new RafflesService()) {
    this.rafflesService = service;
  }

  /**
   * POST /raffles
   */
  create = async (req: Request, res: Response): Promise<void> => {
    const raffleData = req.body as CreateRaffleDTO;
    const raffle = await this.rafflesService.create(raffleData);
    res.status(201).json(raffle);
  };

  /**
   * GET /raffles
   * Query: page, limit, status, userId
   */
  findPaginated = async (req: Request, res: Response): Promise<void> => {
    const { page, limit, status, userId } = req.query as unknown as {
      page: number;
      limit: number;
      status?: RaffleStatus;
      userId?: number;
    };

    const result = await this.rafflesService.findPaginated(page, limit, {
      ...(status ? { status } : {}),
      ...(userId ? { userId } : {})
    });

    res.status(200).json(result);
  };

  /**
   * GET /raffles/:id
   */
  findById = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params['id']);
    const raffle = await this.rafflesService.findById(id);
    res.status(200).json(raffle);
  };

  /**
   * GET /raffles/public/:publicId
   */
  findByPublicId = async (req: Request, res: Response): Promise<void> => {
    const publicId = (req.params['publicId'] ?? '') as string;
    const raffle = await this.rafflesService.findByPublicId(publicId);
    res.status(200).json(raffle);
  };

  /**
   * PATCH /raffles/:id
   */
  update = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params['id']);
    const raffle = await this.rafflesService.update(id, req.body as UpdateRaffleDTO);
    res.status(200).json(raffle);
  };

  /**
   * PATCH /raffles/:id/status
   * Body: { status: RaffleStatus }
   */
  changeStatus = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params['id']);
    const { status } = req.body as { status: RaffleStatus };
    const raffle = await this.rafflesService.changeStatus(id, status);
    res.status(200).json(raffle);
  };

  /**
   * GET /raffles/user/:userId
   */
  findByUserId = async (req: Request, res: Response): Promise<void> => {
    const userId = Number(req.params['userId']);
    const raffles = await this.rafflesService.findByUserId(userId);
    res.status(200).json(raffles);
  };

  /**
   * DELETE /raffles/:id
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params['id']);
    await this.rafflesService.delete(id);
    res.status(204).send();
  };
}
