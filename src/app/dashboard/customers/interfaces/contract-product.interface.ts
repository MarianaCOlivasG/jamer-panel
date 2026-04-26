import { Product } from "../../catalogue/interfaces";
import { Address } from "./address.interface";


export interface ContractProduct {
    id: number,
    productId: number,
    budgetId: number,
    addresses: Address[],
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

    // onlyHtml
    checked: boolean;
}