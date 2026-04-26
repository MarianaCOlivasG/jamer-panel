import { Purchase } from "../../purchases/interfaces/purchase.interface";
import { WorkOrder } from "../../work-orders/interfaces/work-order.interface";
import { Product } from "./product.interface";


export interface Kardex {
    action: 'purchase' | 'work-order';
    amont: number;
    canceledAt: Date;
    cost: number;
    createdAt: Date;
    id: number;
    product: Product;
    productId: number;
    purchase: Purchase;
    purchaseId: number;
    workOrder: WorkOrder;
    workOrderId: number;
    status: string;
    concept: 'in' | 'out';
    updatedAt: Date;
}