import { BusinessLine } from "./business-line.interface";

export interface BusinessFamily {
    id: number;
    name: string;
    code: string;
    businessLineId: number;
    businessLine: BusinessLine;
    description: string;
    isActive: boolean;
}