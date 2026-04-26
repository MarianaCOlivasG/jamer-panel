import { Employee } from "../../employees/interfaces";


export interface Store {
    id: number;
    name: string;
    ubication: string;
    observations: string,
    employeeId: number,
    isActive: boolean,
    employee: Employee;
}