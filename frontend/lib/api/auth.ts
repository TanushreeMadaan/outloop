import api from "../api";

export interface UserProfile {
    userId: string;
    email: string;
    role: string;
}

export const getMe = async (): Promise<UserProfile> => {
    const res = await api.get("/auth/me");
    return res.data;
};
