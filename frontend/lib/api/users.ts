import api from "../api";
import { User } from "@/types";

export const getUsers = async () => {
    const res = await api.get("/users");
    return res.data;
};

export const createUser = async (data: any) => {
    const res = await api.post("/users", data);
    return res.data;
};

export const updateUser = async (id: string, data: any) => {
    const res = await api.patch(`/users/${id}`, data);
    return res.data;
};

export const deleteUser = async (id: string) => {
    await api.delete(`/users/${id}`);
};

export const changeUserPassword = async (id: string, data: { password: string }) => {
    const res = await api.patch(`/users/${id}/password`, data);
    return res.data;
};
