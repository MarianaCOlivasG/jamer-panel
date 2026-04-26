import { CustomerType } from "./customer-type.interface";


export interface Customer {
    id: number;
    name: string;
    lastName?: string;
    phone?: string;
    cellPhone: string;
    email: string;
    representative?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    address?: string;
    type: CustomerType;
    cfdi: string;
    rs: string;
    rfc: string;
    observations?: string;
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
    csfFile?: string;
    contacts: { name: string, phone: string; position: string, email: string }[]
    payType?: string;
    creditDays?: number
}