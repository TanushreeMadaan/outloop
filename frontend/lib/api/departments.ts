import api from "../api";
import { Department } from "@/types";

export const getDepartments = async (): Promise<Department[]> => {
    const res = await api.get("/departments");
    return res.data;
};

export const createDepartment = async (data: { name: string }): Promise<Department> => {
    const res = await api.post("/departments", data);
    return res.data;
};
export const updateDepartment = async (id: string, data: { name: string }): Promise<Department> => {
    const res = await api.patch(`/departments/${id}`, data);
    return res.data;
};

export const deleteDepartment = async (id: string): Promise<void> => {
    await api.delete(`/departments/${id}`);
};
