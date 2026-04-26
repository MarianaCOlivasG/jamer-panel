

export interface WorkTool {
    id: number;
    name: string;
    brand: string;
    model: string;
    description: string;
    totalStock: number;
    availableStock: number;
    cost: string;
    image: string;
    qr: string;
    isAvailable: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    workToolsStore: WorkToolsStore[];
}

export interface WorkToolsStore {
    amount: string;
    createdAt: string;
    id: string;
    storeId: string;
    updatedAt: string;
    workToolId: string;
}

