import { Employee } from "../../employees/interfaces";


export interface Vehicle {
    id: number;
    brand: string;
    model: string;
    year: string;
    registration: string;
    color: string;
    policy: string;
    policyFile: string;
    image: string;
    isAvailable: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    employeId: number;
    employee: Employee
}
