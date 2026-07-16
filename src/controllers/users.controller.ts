import { type CreateUserDTO, type UpdateUserDTO } from '@dtos/user.dto';
import { UsersService } from '@services/users.service';
import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class UsersController {
  private readonly usersService: UsersService;

  constructor(service = new UsersService()) {
    this.usersService = service;
  }

  /**
   * POST /users
   */
  create = async (req: Request, res: Response): Promise<void> => {
    const userData = req.body as CreateUserDTO;
    const user = await this.usersService.create(userData);
    res.status(StatusCodes.CREATED).json(user);
  };

  /**
   * GET /users
   * Query: page, limit, search
   */
  findPaginated = async (req: Request, res: Response): Promise<void> => {
    const { page, limit, search } = req.query;

    const userFilters = {
      ...(search ? { search: String(search) } : {})
    };

    const result = await this.usersService.findPaginated(Number(page), Number(limit), userFilters);

    res.status(StatusCodes.OK).json(result);
  };

  /**
   * GET /users/:id
   */
  findById = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params['id']);
    const user = await this.usersService.findById(id);
    res.status(StatusCodes.OK).json(user);
  };

  /**
   * PUT /users/:id
   */
  update = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params['id']);
    const data = req.body as UpdateUserDTO;
    const user = await this.usersService.update(id, data);
    res.status(StatusCodes.OK).json(user);
  };

  /**
   * DELETE /users/:id
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params['id']);
    await this.usersService.delete(id);
    res.status(StatusCodes.NO_CONTENT).send();
  };
}
