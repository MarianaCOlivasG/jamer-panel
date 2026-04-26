import { Purchase } from "../../purchases/interfaces/purchase.interface";

export interface Balance {
   id: number;
   amount: number;
   paymentTotal: string;
   balance: number | string;
   paymentId: number;
   purchaseId: number;
   supplierId: number;
   concept: 'purchase' | 'payment';
   comment: string;
   createdAt: Date;
   updatedAt: Date;
   purchase: Purchase;
   bPurchase: { id: number }
   file?: string;
   paymentAt: Date;
}