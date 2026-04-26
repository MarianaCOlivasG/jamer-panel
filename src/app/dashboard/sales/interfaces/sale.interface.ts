import { Product } from "../../catalogue/interfaces";
import { Customer } from "../../customers/interfaces";
import { Employee } from "../../employees/interfaces";


export interface Sale {
    folio: string;
    observations: string;
    discount: string;
    createdById: string;
    createdBy: Employee;
    customerId: string;
    customer: Customer;
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
    productsSale: ProductsSales[];
    expirationDate: Date;
    currency: string;
    paymentMethod: string;
    // payments: Payment[];
    refSupplier: string;
    iepsPorcent: number;
}


interface ProductsSales {
    id: number,
    amount: number,
    unit: string,
    cost: number,
    iva: number,
    totalWithoutIva: number,
    totalWithIva: number,
    product: Product
}


