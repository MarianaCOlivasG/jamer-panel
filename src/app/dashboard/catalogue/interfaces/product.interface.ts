import { Supplier } from "../../suppliers/interfaces";
import { BusinessFamily } from "./business-family.interface";
import { BusinessLine } from "./business-line.interface";
import { ProductType } from "./product-type.interface";


export interface Product {
    id: number;
    productTypeId: number;
    productType: ProductType;
    image: string;
    name: string;
    totalStock: number;
    availableStock: number;
    description: string;
    healthRegister: string;
    isActive: boolean;
    supplierId: number;
    supplier: Supplier;
    businessLineId: number;
    businessLine: BusinessLine;
    businessFamilyId: number;
    businessFamily: BusinessFamily;
    onSale: boolean
    priceSale: string
    cost: string;
    iepsPorcent: string;
    ieps: string;
    iva: string;
    total: string;
    productStores: {id: string; amount: number, isReported: boolean}[];
    amount?: number;
    productFiles: {id: string, fileName: string}[];
    unit: string;
    htmlDescription?: any;
    showDescription?: boolean
    showHtmlDescription?: boolean;
    minStock: number;
    unitOut: string;

    // Only html -> importe
    totalInputView: number;

    // Only html contracts 
    addressId: any;
    addresses: any[];
    select: boolean;
    // End Only html contracts 
}