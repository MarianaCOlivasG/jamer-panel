import { Purchase } from "./purchase.interface";


export interface Payment {
    id?: string;
    concept: string;
    amount: string | number;
    file?: string;
    purchase?: Purchase;
    createdAt?: Date;
    updatedAt?: Date;
}