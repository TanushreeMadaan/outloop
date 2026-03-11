"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { TrendingUp, Target } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { getDashboardSummary } from "@/lib/api/dashboard";
import { getDashboardCharts } from "@/lib/api/reports";
import { getMe } from "@/lib/api/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemSkeleton } from "@/components/ItemSkeleton";
import { Transaction } from "@/types";

const COLORS = ["#c8d2f6", "#f1c9c0", "#d8ead8"];
const gradientClasses = [
  "gradient-flow-lilac",
  "gradient-flow-mint",
  "gradient-flow-amber",
  "gradient-flow-sky",
  "gradient-flow-rose",
];

const tooltipStyle = {
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.72)",
  boxShadow: "0 24px 60px -36px rgba(118,112,156,0.42)",
  fontSize: "10px",
  background: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(18px)",
};

export default function DashboardPage() {
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
  });

  const { data: charts, isLoading: isLoadingCharts } = useQuery({
    queryKey: ["dashboard-charts"],
    queryFn: getDashboardCharts,
    enabled: user?.role === "ADMIN",
  });

  const isLoading = isLoadingSummary || (user?.role === "ADMIN" && isLoadingCharts);

  if (isLoading) {
    return (
      <div className="page-shell">
        <ItemSkeleton />
      </div>
    );
  }

  const accuracyData = charts?.accuracy
    ? [
        { name: "On-Time", value: charts.accuracy.onTime },
        { name: "Overdue", value: charts.accuracy.overdue },
        { name: "Pending", value: charts.accuracy.pending },
      ]
    : [];

  const stats = [
    {
      label: "Total Transactions",
      value: summary?.totalTransactions || 0,
      subLabel: `${summary?.returnableCount || 0} Returnable`,
      icon: (
        <svg className="h-5 w-5 text-[rgb(104,114,176)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      color: "bg-[rgba(217,223,248,0.78)] text-[rgb(104,114,176)]",
    },
    {
      label: "Active Vendors",
      value: summary?.totalVendors || 0,
      subLabel: "Trusted partners",
      icon: (
        <svg className="h-5 w-5 text-[rgb(86,140,112)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: "bg-[rgba(222,238,228,0.82)] text-[rgb(86,140,112)]",
    },
    {
      label: "Total Items",
      value: summary?.totalItems || 0,
      subLabel: "In catalog",
      icon: (
        <svg className="h-5 w-5 text-[rgb(176,131,82)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "bg-[rgba(248,232,207,0.86)] text-[rgb(176,131,82)]",
    },
    {
      label: "Departments",
      value: summary?.totalDepartments || 0,
      subLabel: "Active centers",
      icon: (
        <svg className="h-5 w-5 text-[rgb(99,132,170)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "bg-[rgba(214,230,247,0.86)] text-[rgb(99,132,170)]",
    },
    {
      label: "Pending Returns",
      value: summary?.pendingReturns || 0,
      subLabel: `${summary?.overdueReturns || 0} Overdue`,
      icon: (
        <svg className="h-5 w-5 text-[rgb(170,97,112)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-[rgba(246,221,223,0.88)] text-[rgb(170,97,112)]",
    },
  ];

  return (
    <div className="page-shell space-y-8">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Real-time overview of your asset operations</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, i) => (
          <Card key={i} className={`soft-gradient-card ${gradientClasses[i % gradientClasses.length]} overflow-hidden transition-all duration-200 hover:-translate-y-0.5`}>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className={`soft-icon-chip h-11 w-11 ${stat.color}`}>{stat.icon}</div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{stat.label}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <h2 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">{stat.value}</h2>
                  <span className={`text-[10px] font-medium ${stat.label === "Pending Returns" && (summary?.overdueReturns || 0) > 0 ? "animate-pulse text-[rgb(170,97,112)]" : "text-muted-foreground"}`}>
                    {stat.subLabel}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {user?.role === "ADMIN" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="soft-gradient-card gradient-flow-sky lg:col-span-2 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="h-4 w-4 text-[rgb(128,142,196)]" />
                Transaction Volume (30d)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[240px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts?.trends || []}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c8d2f6" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#c8d2f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ba3bf" }} hide />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="total" stroke="#9fafe8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="soft-gradient-card gradient-flow-lilac overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Target className="h-4 w-4 text-[rgb(143,132,192)]" />
                Return Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent className="flex h-[240px] items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={accuracyData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {accuracyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-[-0.03em] text-foreground">Recent Transactions</h2>
          <Link href="/transactions" className="inline-flex items-center gap-1 text-sm font-medium text-[rgb(119,132,189)] transition-colors hover:text-[rgb(99,111,167)]">
            View All
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="table-shell">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="table-head">
                  <th className="px-6 py-3.5">ID & Date</th>
                  <th className="px-6 py-3.5">Vendor</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Summary</th>
                  <th className="px-6 py-3.5 text-right">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {summary?.recentTransactions.map((transaction: Transaction) => (
                  <tr key={transaction.id} className="table-row">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[9px] text-muted-foreground">#{transaction.id.slice(0, 8)}</span>
                        <span className="text-xs font-medium text-foreground/78">
                          {new Date(transaction.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-semibold text-foreground">{transaction.vendor.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-medium text-[rgb(115,124,178)]">{transaction.department.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="soft-tag bg-[rgba(246,244,249,0.88)] text-muted-foreground">
                        {transaction.items.length} {transaction.items.length === 1 ? "Item" : "Items"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`soft-tag ${transaction.isReturnable ? "bg-[rgba(248,232,207,0.86)] text-[rgb(176,131,82)]" : "bg-[rgba(222,238,228,0.86)] text-[rgb(86,140,112)]"}`}>
                          {transaction.isReturnable ? "Returnable" : "Consumable"}
                        </span>
                        {transaction.isReturnable && transaction.expectedReturnDate && (
                          <span className="rounded-full border border-white/70 bg-[rgba(246,244,249,0.88)] px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
                            Due {new Date(transaction.expectedReturnDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
