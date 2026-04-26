import { Product } from "../../catalogue/interfaces";
import { Employee } from "../../employees/interfaces";
import { Address } from "./address.interface";
import { Budget } from "./budget.interface";
import { ContractProduct } from "./contract-product.interface";
import { Customer } from "./customer.interface";

export interface Contract {

    id: string
    folio:  string
    createdBy: Employee;
    createdById: number;
    customer: Customer;
    customerId: number;
    addressId: number;
    budgetId: number;
    budget: Budget;
    paymentMethod: string;
    typeWork: string;
    totalWithoutIva: string;
    iva: string;
    totalWithIva:  string;
    isActive: boolean;
    file: string;
    createdAt: Date;
    updatedAt: Date;
    contractsProducts: ContractProduct[];
    htmlDescription?: string;
    expirationDate?: Date;
    addresses: Address[];
  

}



