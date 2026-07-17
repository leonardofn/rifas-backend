import { type AuthenticatedUser } from '@shared/interfaces/authenticated-user.interface';

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser;
    }
  }
}

export {};
