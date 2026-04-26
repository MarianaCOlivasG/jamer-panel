import { Product } from "../../catalogue/interfaces";



export interface HtmlDescription {
    id: number;
    product?: Product;
    productId?: number;
    htmlDescription: string;
    title: string;
    isActive: boolean;
}