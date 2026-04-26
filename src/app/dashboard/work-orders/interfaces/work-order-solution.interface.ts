import { Employee } from "../../employees/interfaces";
import { WorkOrder } from "./work-order.interface";

export interface WorkOrderSolution {
    employee: Employee;
    sanitaryName: string;
    sanitary_signature: any;
    worker_signature: any;
    createdAt: Date;
    customer_name: string;
    deficiencies: string;
    description: string;
    evaluation: string;
    id: number;
    isActive: boolean;
    pest_detected: string;
    rating: Number
    signature: any
    updatedAt: Date;
    workOrder: WorkOrder;
    workOrderId: number;
    work_done: string;
    workOrderSolutionsProducts: any[]
    images: string[]
    products?: any[];
}