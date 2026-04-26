import { WorkTool } from "./work-tool.interface";

export interface Maintenance {
    id: number;
    workTool: WorkTool;
    workToolId: number;
    departureDate: Date;
    entryDate: Date;
    isActive: boolean;
    isCurrent: boolean;
    createdAt: Date;
    updatedAt: Date;
    observations: string;
}