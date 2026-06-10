import { type PaymentStatus } from '../enums/payment-status';

export interface IPurchasePaginationOptions {
  page?: number;
  limit?: number;
  paymentStatus?: PaymentStatus;
}
