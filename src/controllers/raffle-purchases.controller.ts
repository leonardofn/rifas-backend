import {
  type CreateRafflePurchaseDTO,
  type UpdateRafflePurchaseDTO
} from '@dtos/raffle-purchase.dto';
import { RafflePurchasesService } from '@services/raffle-purchases.service';
import { AppConstants } from '@shared/constants';
import { type PaymentStatus } from '@shared/enums/payment-status';
import { type IPurchasePaginationOptions } from '@shared/interfaces/pagination.interface';
import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class RafflePurchasesController {
  private readonly purchasesService: RafflePurchasesService;

  constructor(service = new RafflePurchasesService()) {
    this.purchasesService = service;
  }

  /**
   * POST /raffle-purchases
   */
  create = async (req: Request, res: Response): Promise<void> => {
    const data = req.body as CreateRafflePurchaseDTO;
    const purchase = await this.purchasesService.create(data);
    res.status(StatusCodes.CREATED).json(purchase);
  };

  /**
   * GET /raffle-purchases/:id
   */
  findById = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params['id']);
    const purchase = await this.purchasesService.findById(id);
    res.status(StatusCodes.OK).json(purchase);
  };

  /**
   * GET /raffle-purchases/raffle/:raffleId
   * Query: page, limit, paymentStatus
   */
  findByRaffleId = async (req: Request, res: Response): Promise<void> => {
    const raffleId = Number(req.params['raffleId']);
    const { page, limit, paymentStatus } = req.query;

    const paginationOptions: IPurchasePaginationOptions = {
      page: Number(page) || AppConstants.DEFAULT_PAGE,
      limit: Number(limit) || AppConstants.DEFAULT_LIMIT,
      paymentStatus: (paymentStatus as PaymentStatus) || undefined
    };

    const result = await this.purchasesService.findByRaffleId(raffleId, paginationOptions);

    res.status(StatusCodes.OK).json(result);
  };

  /**
   * GET /raffle-purchases/user/:userId
   * Query: page, limit, paymentStatus
   */
  findByUserId = async (req: Request, res: Response): Promise<void> => {
    const userId = Number(req.params['userId']);
    const { page, limit, paymentStatus } = req.query;

    const paginationOptions: IPurchasePaginationOptions = {
      page: Number(page) || AppConstants.DEFAULT_PAGE,
      limit: Number(limit) || AppConstants.DEFAULT_LIMIT,
      paymentStatus: (paymentStatus as PaymentStatus) || undefined
    };

    const result = await this.purchasesService.findByUserId(userId, paginationOptions);

    res.status(StatusCodes.OK).json(result);
  };

  /**
   * PATCH /raffle-purchases/:id/payment-status
   * Body: { paymentStatus: PaymentStatus }
   */
  updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params['id']);
    const data = req.body as UpdateRafflePurchaseDTO;
    const purchase = await this.purchasesService.updatePaymentStatus(id, data);
    res.status(StatusCodes.OK).json(purchase);
  };

  /**
   * DELETE /raffle-purchases/:id
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params['id']);
    await this.purchasesService.delete(id);
    res.status(StatusCodes.NO_CONTENT).send();
  };
}
