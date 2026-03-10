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

export type TransactionStatus = 'ACTIVE' | 'COMPLETED';

export interface Transaction {
    id: string;
    vendorId: string;
    departmentId: string;
    isReturnable: boolean;
    remarks?: string;
    status: TransactionStatus;
    expectedReturnDate?: string;
    actualReturnDate?: string;
    createdAt: string;
    vendor: Vendor;
    department: Department;
    items: { item: Item; itemId: string }[];
}
