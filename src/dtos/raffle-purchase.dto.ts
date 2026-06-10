import { type PaymentStatus } from '@shared/enums/payment-status';

export interface CreateRafflePurchaseDTO {
  raffleId: number;
  userId: number;
  numberBought: number;
  amountPaid: number;
}

export interface UpdateRafflePurchaseDTO {
  paymentStatus?: PaymentStatus;
}
