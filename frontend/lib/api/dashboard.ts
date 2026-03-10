import api from "../api";
import { Transaction } from "@/types";

export interface DashboardSummary {
    totalTransactions: number;
    returnableCount: number;
    nonReturnableCount: number;
    totalVendors: number;
    totalDepartments: number;
    totalItems: number;
    pendingReturns: number;
    overdueReturns: number;
    recentTransactions: Transaction[];
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
    const response = await api.get("/dashboard/summary");
    return response.data;
};
