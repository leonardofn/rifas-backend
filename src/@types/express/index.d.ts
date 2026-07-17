import { type IAuthenticatedUser } from '@shared/interfaces/authenticated-user.interface';

declare global {
  namespace Express {
    interface Request {
      authUser?: IAuthenticatedUser;
    }
  }
}

export {};
