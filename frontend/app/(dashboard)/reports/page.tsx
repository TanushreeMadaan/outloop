"use client";

import { useQuery } from "@tanstack/react-query";
import { getTransactionTrends, getDepartmentStats, getVendorStats, getReturnAccuracy } from "@/lib/api/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar,
    AreaChart, Area
} from "recharts";
import { TableSkeleton } from "@/components/TableSkeleton";
import { FileDown, TrendingUp, BarChart3, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = ['#c8d2f6', '#ddd0f1', '#f4d9bf', '#d8ead8', '#f1c9c0', '#d6ddf3'];

export default function ReportsPage() {
    const { data: trends = [], isLoading: isLoadingTrends } = useQuery({
        queryKey: ["report-trends"],
        queryFn: getTransactionTrends,
    });

    const { data: deptStats = [], isLoading: isLoadingDepts } = useQuery({
        queryKey: ["report-depts"],
        queryFn: getDepartmentStats,
    });

    const { data: vendorStats = [], isLoading: isLoadingVendors } = useQuery({
        queryKey: ["report-vendors"],
        queryFn: getVendorStats,
    });

    const { data: accuracy, isLoading: isLoadingAccuracy } = useQuery({
        queryKey: ["report-accuracy"],
        queryFn: getReturnAccuracy,
    });

    const accuracyData = accuracy ? [
        { name: 'On-Time', value: accuracy.onTime },
        { name: 'Overdue', value: accuracy.overdue },
        { name: 'Pending', value: accuracy.pending },
    ] : [];

    const handleExportCSV = (data: any[], filename: string) => {
        if (!data.length) return;
        const headers = Object.keys(data[0]).join(",");
        const rows = data.map(obj => Object.values(obj).join(",")).join("\n");
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoadingTrends || isLoadingDepts || isLoadingVendors || isLoadingAccuracy) {
        return <div className="page-shell"><TableSkeleton columns={4} /></div>;
    }

    return (
        <div className="page-shell mx-auto max-w-7xl space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="page-title">System Analytics</h1>
                    <p className="page-subtitle">Deep dive into transaction patterns and organizational performance.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => handleExportCSV(trends, "transaction_trends")}>
                        <FileDown className="w-4 h-4 mr-2" />
                        Export Trends
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Transaction Trends */}
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-[rgb(128,142,196)]" />
                            Transaction Trends
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#c8d2f6" stopOpacity={0.9} />
                                        <stop offset="95%" stopColor="#c8d2f6" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece9f3" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ba3bf' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ba3bf' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.72)', boxShadow: '0 24px 60px -36px rgba(118,112,156,0.42)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(18px)' }}
                                />
                                <Area type="monotone" dataKey="total" stroke="#9fafe8" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Return Accuracy */}
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Target className="w-5 h-5 text-[rgb(143,132,192)]" />
                            Return Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={accuracyData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {accuracyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.72)', boxShadow: '0 24px 60px -36px rgba(118,112,156,0.42)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(18px)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Department Activity */}
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-[rgb(94,144,117)]" />
                            Activity by Department
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece9f3" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.72)', boxShadow: '0 24px 60px -36px rgba(118,112,156,0.42)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(18px)' }}
                                />
                                <Bar dataKey="transactions" fill="#d8ead8" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Vendor Usage */}
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-[rgb(176,131,82)]" />
                            Top Vendors
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={vendorStats.slice(0, 8)}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ece9f3" />
                                <XAxis type="number" axisLine={false} tickLine={false} hide />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} width={100} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.72)', boxShadow: '0 24px 60px -36px rgba(118,112,156,0.42)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(18px)' }}
                                />
                                <Bar dataKey="transactions" fill="#f4d9bf" radius={[0, 6, 6, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Details Table */}
            <div className="table-shell mt-10">
                <CardHeader className="p-6">
                    <CardTitle className="text-lg font-semibold">Activity Log Summary</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="table-head">
                                <th className="p-6">Date</th>
                                <th className="p-6">Total Transactions</th>
                                <th className="p-6">Returnable</th>
                                <th className="p-6">Consumable</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {trends.map((item: any) => (
                                <tr key={item.date} className="table-row">
                                    <td className="p-6 font-medium text-foreground">{item.date}</td>
                                    <td className="p-6 font-bold text-foreground">{item.total}</td>
                                    <td className="p-6 font-semibold text-[rgb(176,131,82)]">{item.returnable}</td>
                                    <td className="p-6 font-semibold text-[rgb(86,140,112)]">{item.consumable}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
