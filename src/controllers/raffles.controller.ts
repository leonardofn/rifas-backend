import { RafflesService } from '@services/raffles.service';
import { AppConstants } from '@shared/constants';
import type { RaffleStatus } from '@shared/enums/ruffle-status';
import type { Request, Response } from 'express';

import { type CreateRaffleDTO, type UpdateRaffleDTO } from '@dtos/raffle.dto';
import { StatusCodes } from 'http-status-codes';

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
    res.status(StatusCodes.CREATED).json(raffle);
  };

  /**
   * GET /raffles
   * Query: page, limit, status, userId
   */
  findPaginated = async (req: Request, res: Response): Promise<void> => {
    const { page, limit, status, userId } = req.query;

    const raffleFilters = {
      ...(status ? { status: status as RaffleStatus } : {}),
      ...(userId ? { userId: Number(userId) } : {})
    };

    const result = await this.rafflesService.findPaginated(
      Number(page),
      Number(limit),
      raffleFilters
    );

    res.status(StatusCodes.OK).json(result);
  };

  /**
   * GET /raffles/trending
   * Query: page, limit
   */
  findTrendingRafflesPaginated = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string, AppConstants.DECIMAL_RADIX) || AppConstants.ONE;
    const limit =
      parseInt(req.query.limit as string, AppConstants.DECIMAL_RADIX) || AppConstants.DEFAULT_LIMIT;

    const safeLimit =
      limit > AppConstants.TRENDING_MAX_LIMIT ? AppConstants.TRENDING_MAX_LIMIT : limit;
    const safePage = page < AppConstants.ONE ? AppConstants.ONE : page;

    const paginatedResponse = await this.rafflesService.findTrendingRafflesPaginated(
      safePage,
      safeLimit
    );

    res.status(StatusCodes.OK).json(paginatedResponse);
  };

  /**
   * GET /raffles/:id
   */
  findById = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params['id']);
    const raffle = await this.rafflesService.findById(id);
    res.status(StatusCodes.OK).json(raffle);
  };

  /**
   * GET /raffles/public/:publicId
   */
  findByPublicId = async (req: Request, res: Response): Promise<void> => {
    const publicId = (req.params['publicId'] ?? '') as string;
    const raffle = await this.rafflesService.findByPublicId(publicId);
    res.status(StatusCodes.OK).json(raffle);
  };

  /**
   * PUT /raffles/:id
   */
  update = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params['id']);
    const updatedRaffleData = req.body as UpdateRaffleDTO;
    const raffle = await this.rafflesService.update(id, updatedRaffleData);
    res.status(StatusCodes.OK).json(raffle);
  };

  /**
   * PATCH /raffles/:id/status
   * Body: { status: RaffleStatus }
   */
  changeStatus = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params['id']);
    const { status } = req.body as { status: RaffleStatus };
    const raffle = await this.rafflesService.changeStatus(id, status);
    res.status(StatusCodes.OK).json(raffle);
  };

  /**
   * GET /raffles/user/:userId
   */
  findByUserId = async (req: Request, res: Response): Promise<void> => {
    const userId = Number(req.params['userId']);
    const raffles = await this.rafflesService.findByUserId(userId);
    res.status(StatusCodes.OK).json(raffles);
  };

  /**
   * DELETE /raffles/:id
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params['id']);
    await this.rafflesService.delete(id);
    res.status(StatusCodes.NO_CONTENT).send();
  };
}
