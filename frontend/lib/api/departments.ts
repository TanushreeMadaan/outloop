import api from "../api";
import { Department } from "@/types";

export const getDepartments = async (): Promise<Department[]> => {
    const res = await api.get("/departments");
    return res.data;
};
