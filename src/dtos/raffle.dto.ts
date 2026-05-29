import { type RaffleStatus } from '@shared/enums/ruffle-status';

export interface CreateRaffleDTO {
  userId: number;
  title: string;
  description?: string;
  imageUrl?: string;
  startNumber: number;
  endNumber: number;
  pricePerNumber: number;
}

export interface UpdateRaffleDTO {
  title?: string;
  description?: string;
  imageUrl?: string;
  status?: RaffleStatus;
}
