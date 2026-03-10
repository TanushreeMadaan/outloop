"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "@/lib/api/dashboard";

import { Card, CardContent } from "@/components/ui/card";
import { ItemSkeleton } from "@/components/ItemSkeleton";
import Link from "next/link";
import { Transaction } from "@/lib/api/transactions";

export default function DashboardPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
  });

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-100px)] p-4 md:p-8">
        <ItemSkeleton />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Transactions",
      value: summary?.totalTransactions || 0,
      subLabel: `${summary?.returnableCount || 0} Returnable`,
      icon: (
        <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      color: "bg-purple-50",
    },
    {
      label: "Active Vendors",
      value: summary?.totalVendors || 0,
      subLabel: "Trusted partners",
      icon: (
        <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: "bg-emerald-50",
    },
    {
      label: "Total Items",
      value: summary?.totalItems || 0,
      subLabel: "In catalog",
      icon: (
        <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "bg-amber-50",
    },
    {
      label: "Departments",
      value: summary?.totalDepartments || 0,
      subLabel: "Active centers",
      icon: (
        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "bg-blue-50",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-100px)] space-y-6 p-4 md:p-8 bg-white">

      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time overview of your asset operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded bg-blue-50`}>
                  {stat.icon}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="text-2xl font-semibold text-gray-900">{stat.value}</h2>
                  <span className="text-xs text-gray-500">{stat.subLabel}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <Link
            href="/transactions"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View All
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="w-full overflow-hidden rounded-2xl border bg-white/60 backdrop-blur-md shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50/50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3.5">ID & Date</th>
                  <th className="px-6 py-3.5">Vendor</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Summary</th>
                  <th className="px-6 py-3.5 text-right">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {summary?.recentTransactions.map((transaction: Transaction) => (
                  <tr key={transaction.id} className="group transition-colors hover:bg-white/80">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[9px] text-gray-400">#{transaction.id.slice(0, 8)}</span>
                        <span className="text-xs font-medium text-gray-600">
                          {new Date(transaction.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[13px]">
                        <span className="font-semibold text-gray-800">{transaction.vendor.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[13px]">
                        <span className="font-medium text-purple-700">{transaction.department.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-gray-100 text-gray-500 rounded-md border border-gray-200 uppercase tracking-tighter">
                          {transaction.items.length} {transaction.items.length === 1 ? 'Item' : 'Items'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight ${transaction.isReturnable
                          ? "bg-amber-50 text-amber-600 border border-amber-100"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          }`}>
                          {transaction.isReturnable ? "Returnable" : "Consumable"}
                        </span>
                        {transaction.isReturnable && transaction.expectedReturnDate && (
                          <span className="text-[9px] font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                            Due {new Date(transaction.expectedReturnDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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