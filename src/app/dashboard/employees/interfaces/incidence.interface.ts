import { Employee } from "./employee.interface";



export interface Incidence {
    id: number;
    title: string;
    description: string;
    isActive: boolean;
    isRead: boolean;
    isValidated: boolean;
    file: string;
    employeeId: number,
    employee: Employee,
    signature: string;
    createdAt: Date
}