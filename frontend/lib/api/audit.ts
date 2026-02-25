import api from "../api";

export interface AuditLog {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    performedById: string;
    oldValue: any;
    newValue: any;
    createdAt: string;
    performedBy?: {
        email: string;
    };
}

export const getAuditLogs = async (params?: Partial<AuditLog>): Promise<AuditLog[]> => {
    const res = await api.get("/audit-logs", { params });
    return res.data;
};
