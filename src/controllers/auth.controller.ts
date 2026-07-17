import { type LoginDTO, type RefreshTokenDTO, type RegisterDTO } from '@dtos/auth.dto';
import { AuthService } from '@services/auth.service';
import { AppError } from '@shared/errors/app-error';
import { type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class AuthController {
  private readonly authService: AuthService;

  constructor(service = new AuthService()) {
    this.authService = service;
  }

  /**
   * POST /auth/register
   */
  register = async (req: Request, res: Response): Promise<void> => {
    const data = req.body as RegisterDTO;
    const result = await this.authService.register(data);
    res.status(StatusCodes.CREATED).json(result);
  };

  /**
   * POST /auth/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    const data = req.body as LoginDTO;
    const result = await this.authService.login(data);
    res.status(StatusCodes.OK).json(result);
  };

  /**
   * POST /auth/refresh
   */
  refresh = async (req: Request, res: Response): Promise<void> => {
    const data = req.body as RefreshTokenDTO;
    const tokens = await this.authService.refresh(data);
    res.status(StatusCodes.OK).json(tokens);
  };

  /**
   * GET /auth/me
   */
  me = async (req: Request, res: Response): Promise<void> => {
    if (!req.authUser) {
      throw new AppError('Usuário não autenticado.', StatusCodes.UNAUTHORIZED);
    }

    const user = await this.authService.me(req.authUser.id);
    res.status(StatusCodes.OK).json(user);
  };

  /**
   * POST /auth/logout
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    if (!req.authUser) {
      throw new AppError('Usuário não autenticado.', StatusCodes.UNAUTHORIZED);
    }

    await this.authService.logout(req.authUser.id);
    res.status(StatusCodes.NO_CONTENT).send();
  };
}
