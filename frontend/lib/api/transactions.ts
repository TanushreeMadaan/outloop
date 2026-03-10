import api from "../api";
import { Vendor, Department, Item, Transaction } from "@/types";

export const getTransactions = async (params?: any) => {
    const res = await api.get("/transactions", { params });
    return res.data;
};

export const createTransaction = async (data: any) => {
    const res = await api.post("/transactions", data);
    return res.data;
};

export const updateTransaction = async ({ id, ...data }: any) => {
    const res = await api.patch(`/transactions/${id}`, data);
    return res.data;
};

export const markAsReturned = async (id: string, actualReturnDate: string) => {
    const res = await api.patch(`/transactions/${id}/return`, { actualReturnDate });
    return res.data;
};

export const deleteTransaction = async (id: string) => {
    await api.delete(`/transactions/${id}`);
};
