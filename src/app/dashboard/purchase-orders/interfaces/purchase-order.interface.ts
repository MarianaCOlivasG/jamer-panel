import { Product } from '../../catalogue/interfaces';
import { Employee } from '../../employees/interfaces';
import { Supplier } from '../../suppliers/interfaces';


export interface PurchaseOrder {
    folio: string;
    observations: string;
    discount: string;
    createdById: string;
    createdBy: Employee;
    supplierId: string;
    supplier: Supplier;
    file: string;
    id: string;
    subTotal: string;
    subTotalWithDiscount: string;
    ieps: string;
    iva: string;
    totalWithIva: string;
    createdAt: string;
    updatedAt: string;
    productsPurchaseOrder: ProductsPurchaseOrder[]
    iepsPorcent: number,
    withIva: boolean
}


interface ProductsPurchaseOrder {
    id: number,
    amount: number,
    unit: string,
    cost: number,
    iva: number,
    totalWithoutIva: number,
    totalWithIva: number,
    product: Product
}