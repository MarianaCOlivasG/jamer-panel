import { Customer } from "../../customers/interfaces";
import { WorkOrder } from "../../work-orders/interfaces/work-order.interface";

export interface BalanceCustomer {
   id: number;
   amount: number;
   paymentTotal: string;
   balance: number | string;
   comment: string;
   concept: string;
   method: string;
   createdAt: Date;
   updatedAt: Date;
   customer: Customer;
   customerId: number;
   workOrder: WorkOrder
   facturaOrRemision: string;
}