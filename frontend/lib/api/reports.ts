import api from "../api";

export const getTransactionTrends = async () => {
    const res = await api.get("/reports/transaction-trends");
    return res.data;
};

export const getDepartmentStats = async () => {
    const res = await api.get("/reports/department-stats");
    return res.data;
};

export const getVendorStats = async () => {
    const res = await api.get("/reports/vendor-stats");
    return res.data;
};

export const getReturnAccuracy = async () => {
    const res = await api.get("/reports/return-accuracy");
    return res.data;
};

export const getDashboardCharts = async () => {
    const res = await api.get("/reports/dashboard-charts");
    return res.data;
};
