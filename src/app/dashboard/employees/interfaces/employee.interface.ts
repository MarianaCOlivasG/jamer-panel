import { User } from "src/app/auth/interfaces/user.interface";

export interface Employee {
    id: number;
    name: string;
    lastName: string;
    email: string;
    phone: string;
    cellPhone: string;
    picture: string;
    address: string;
    user: User,
    userUid: string,
    workstation: string;
    no?: string
    curp: string
    rfc: string
    nss: string
    admissionDate?: string
    dismissalDate?: string
    emergencyPhone?: string
    color?: string
    pFiles: { id: number, fileName: string }[];
    permissions: any;
}