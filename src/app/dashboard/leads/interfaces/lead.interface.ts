

export interface Lead {
    id: number;
    fullName: string;
    phone: string;
    email: string;
    message: string;
    createdAt?: Date;
    updatedAt?: Date;
    isCustomer: boolean;
}