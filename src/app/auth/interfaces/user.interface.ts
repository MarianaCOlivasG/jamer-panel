


export interface User {
    id: number;
    isActive: boolean;
    lastName: string;
    userName: string;
    name: string;
    picture: string;
    uid: string;
    role: { id: number, key: string, value: string }
    accessTypeId: number;
    roleId: number;
}