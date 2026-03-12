import api from "../api";
import { Department, Role } from "@/types";

export interface UserProfile {
    userId: string;
    email: string;
    role: Role;
    departmentId?: string;
    department?: Department;
}

export const getMe = async (): Promise<UserProfile> => {
    const res = await api.get("/auth/me");
    return res.data;
};
