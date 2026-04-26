import { Product } from "../../catalogue/interfaces";
import { Employee } from "../../employees/interfaces";
import { Address } from "./address.interface";
import { Customer } from "./customer.interface";

export interface Budget {

    id: string
    folio:  string
    createdBy: Employee;
    createdById: number;
    customer: Customer;
    customerId: number;
    addresses: Address[];
    addressId: number;
    paymentMethod:  string
    typeWork:  string
    totalWithoutIva:  string
    iva:  string
    totalWithIva:  string
    isActive: boolean
    file: string
    createdAt: Date;
    updatedAt: Date;
    budgetsProducts: BudgetProduct[];
    htmlDescription?: string;
    htmlGuarantee?: string;
}



interface BudgetProduct {
    id: number,
    productId: number,
    budgetId: number,
    amount: number,
    unitPrice: number,
    iva: number,
    totalWithoutIva: number,
    totalWithIva: number,
    createdAt: Date,
    updatedAt: Date,
    product: Product,
    htmlDescription: string;
    showDescription: boolean;
}