export interface CreatePrizeDTO {
  raffleId: number;
  title: string;
  description?: string;
  imageUrl?: string;
  prizeOrder?: number;
  value?: number;
}

export interface UpdatePrizeDTO {
  title?: string;
  description?: string;
  imageUrl?: string;
  prizeOrder?: number;
  value?: number;
}
