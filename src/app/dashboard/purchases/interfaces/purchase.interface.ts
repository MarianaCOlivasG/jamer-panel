import { Product } from '../../catalogue/interfaces';
import { Employee } from '../../employees/interfaces';
import { Supplier } from '../../suppliers/interfaces';
import { Payment } from './payment.interface';


export interface Purchase {
    folio: string;
    observations: string;
    discount: string;
    createdById: string;
    createdBy: Employee;
    supplierId: string;
    supplier: Supplier;
    file: string;
    id: number;
    subTotal: string;
    subTotalWithDiscount: string;
    ieps: string;
    iva: string;
    status: string;
    totalWithIva: string;
    createdAt: string;
    updatedAt: string;
    productsPurchases: ProductsPurchases[];
    expirationDate: Date;
    currency: string;
    paymentMethod: string;
    payments: Payment[];
    iepsPorcent: number,
    withIva: boolean
    refSupplier: string;
}


interface ProductsPurchases {
    id: number,
    amount: number,
    unit: string,
    cost: number,
    iva: number,
    totalWithoutIva: number,
    totalWithIva: number,
    product: Product
}


