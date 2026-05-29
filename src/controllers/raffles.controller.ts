import { RafflesService } from '@services/raffles.service';
import type { RaffleStatus } from '@shared/enums/ruffle-status';
import type { NextFunction, Request, Response } from 'express';

import { type CreateRaffleDTO, type UpdateRaffleDTO } from '@dtos/raffle.dto';

export class RafflesController {
  private readonly rafflesService: RafflesService;

  constructor(service = new RafflesService()) {
    this.rafflesService = service;
  }

  /**
   * POST /raffles
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const raffle = await this.rafflesService.create(req.body as CreateRaffleDTO);
      res.status(201).json(raffle);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /raffles
   * Query: page, limit, status, userId
   */
  findPaginated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, status, userId } = req.query as unknown as {
        page: number;
        limit: number;
        status?: RaffleStatus;
        userId?: number;
      };

      const result = await this.rafflesService.findPaginated(page, limit, {
        ...(status !== undefined ? { status } : {}),
        ...(userId !== undefined ? { userId } : {})
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /raffles/:id
   */
  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params['id']);
      const raffle = await this.rafflesService.findById(id);
      res.status(200).json(raffle);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /raffles/public/:publicId
   */
  findByPublicId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const publicId = (req.params['publicId'] ?? '') as string;
      const raffle = await this.rafflesService.findByPublicId(publicId);
      res.status(200).json(raffle);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /raffles/:id
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params['id']);
      const raffle = await this.rafflesService.update(id, req.body as UpdateRaffleDTO);
      res.status(200).json(raffle);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /raffles/:id/status
   * Body: { status: RaffleStatus }
   */
  changeStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params['id']);
      const { status } = req.body as { status: RaffleStatus };
      const raffle = await this.rafflesService.changeStatus(id, status);
      res.status(200).json(raffle);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /raffles/:id
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params['id']);
      await this.rafflesService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
