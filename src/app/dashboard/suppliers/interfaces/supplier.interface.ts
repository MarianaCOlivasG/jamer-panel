import { SuppliersType } from "./suppliers_type.interface";

export interface Supplier {
    id: number;
    name: string;
    rs: string;
    rfc: string;
    cfdi?: string;
    email: string;
    phone: string;
    cellPhone: string;
    observations: string;
    isActive: boolean;
    typeId?: number;
    type: SuppliersType;
    address_street?: string;
    address_no_ext?: string;
    address_no_int?: string;
    address_between_street?: string;
    address_cp?: string;
    address_state?: string;
    address_locality?: string;
    address_municipality?: string;
    address_colony?: string;
    address_references?: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    contacts: { name: string, phone: string; position: string, email: string }[];
}