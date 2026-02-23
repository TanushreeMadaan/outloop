import api from "../api";
import { Transaction } from "./transactions";

export interface DashboardSummary {
    totalTransactions: number;
    returnableCount: number;
    nonReturnableCount: number;
    totalVendors: number;
    totalDepartments: number;
    totalItems: number;
    recentTransactions: Transaction[];
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
    const response = await api.get("/dashboard/summary");
    return response.data;
};
