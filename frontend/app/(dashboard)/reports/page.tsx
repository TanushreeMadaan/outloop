"use client";

import { useQuery } from "@tanstack/react-query";
import { getTransactionTrends, getDepartmentStats, getVendorStats, getReturnAccuracy } from "@/lib/api/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar,
    AreaChart, Area
} from "recharts";
import { TableSkeleton } from "@/components/TableSkeleton";
import { FileDown, TrendingUp, BarChart3, PieChart as PieChartIcon, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#6366f1'];

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
        return <div className="p-8"><TableSkeleton columns={4} /></div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Analytics</h1>
                    <p className="text-gray-500 mt-2 font-medium">Deep dive into transaction patterns and organizational performance.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-2xl" onClick={() => handleExportCSV(trends, "transaction_trends")}>
                        <FileDown className="w-4 h-4 mr-2" />
                        Export Trends
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Transaction Trends */}
                <Card className="rounded-3xl border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            Transaction Trends
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Return Accuracy */}
                <Card className="rounded-3xl border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-500" />
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
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Department Activity */}
                <Card className="rounded-3xl border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-emerald-500" />
                            Activity by Department
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="transactions" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Vendor Usage */}
                <Card className="rounded-3xl border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-amber-500" />
                            Top Vendors
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={vendorStats.slice(0, 8)}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} hide />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} width={100} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="transactions" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Details Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden shadow-gray-200/50 mt-10">
                <CardHeader className="p-6">
                    <CardTitle className="text-lg font-bold">Activity Log Summary</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 font-bold uppercase tracking-wider text-gray-400 text-[11px]">
                                <th className="p-6">Date</th>
                                <th className="p-6">Total Transactions</th>
                                <th className="p-6">Returnable</th>
                                <th className="p-6">Consumable</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {trends.map((item: any) => (
                                <tr key={item.date} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-6 font-medium text-gray-950">{item.date}</td>
                                    <td className="p-6 font-bold">{item.total}</td>
                                    <td className="p-6 text-amber-600 font-semibold">{item.returnable}</td>
                                    <td className="p-6 text-emerald-600 font-semibold">{item.consumable}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
