export interface Vendor {
    id: string;
    name: string;
    address?: string;
    email?: string;
    phoneNo?: string;
    gstNumber?: string;
    createdAt: string;
}

export interface Item {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
}

export interface Department {
    id: string;
    name: string;
    createdAt: string;
}
