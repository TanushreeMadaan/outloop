"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, markAsReturned } from "@/lib/api/transactions";
import { useState, useMemo } from "react";
import { TransactionModal } from "@/components/TransactionModal";
import { ReturnModal } from "@/components/ReturnModal";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Transaction, Item, Vendor, Department } from "@/types";

import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/Pagination";
import { TableSkeleton } from "@/components/TableSkeleton";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";

export default function TransactionsPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED" | "OVERDUE">("ALL");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { data: transactionsRes, isLoading, isFetched } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => getTransactions(),
    });

    const transactions = transactionsRes?.data || [];

    const createMutation = useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            setIsModalOpen(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            setIsModalOpen(false);
            setSelectedTransaction(null);
        },
    });


    const returnMutation = useMutation({
        mutationFn: ({ id, actualReturnDate }: { id: string; actualReturnDate: string }) =>
            markAsReturned(id, actualReturnDate),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            setIsReturnModalOpen(false);
            setSelectedTransaction(null);
            toast.success("Item marked as returned!");
        },
    });

    const filteredTransactions = useMemo(() => {
        const q = searchQuery.toLowerCase();

        let startDate: Date | null = dateRange?.from || null;
        let endExclusive: Date | null = null;

        if (dateRange?.to) {
            endExclusive = new Date(dateRange.to.getTime() + 24 * 60 * 60 * 1000);
        }

        return transactions.filter((t: Transaction) => {
            const createdAt = new Date(t.createdAt);

            // Date filtering
            if (startDate && createdAt < startDate) return false;
            if (endExclusive && createdAt >= endExclusive) return false;

            // Status filtering
            const isOverdue = t.status === 'ACTIVE' && t.expectedReturnDate && new Date(t.expectedReturnDate) < new Date();

            if (statusFilter === "ACTIVE" && t.status !== "ACTIVE") return false;
            if (statusFilter === "COMPLETED" && t.status !== "COMPLETED") return false;
            if (statusFilter === "OVERDUE" && !isOverdue) return false;

            // Search filtering
            if (!q) return true;
            return (
                t.vendor.name.toLowerCase().includes(q) ||
                t.department.name.toLowerCase().includes(q) ||
                t.remarks?.toLowerCase().includes(q)
            );
        });
    }, [transactions, searchQuery, dateRange, statusFilter]);

    const paginatedTransactions = useMemo(() => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return filteredTransactions.slice(start, end);
    }, [filteredTransactions, page, pageSize]);

    const handleEdit = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedTransaction(null);
        setIsModalOpen(true);
    };


    const handleReturn = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsReturnModalOpen(true);
    };

    const handleReturnSubmit = (actualReturnDate: string) => {
        if (selectedTransaction) {
            returnMutation.mutate({ id: selectedTransaction.id, actualReturnDate });
        }
    };

    const handleModalSubmit = (data: any) => {
        if (selectedTransaction) {
            updateMutation.mutate({ id: selectedTransaction.id, ...data });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <div className="min-h-[calc(100vh-100px)] p-4 md:p-8 bg-white">

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
                    <p className="text-sm text-gray-500 mt-1">Monitor inward and outward item movements</p>
                </div>
                <Button onClick={handleAdd}>
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Record Transaction
                </Button>
            </div>

            <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search by vendor, department or remarks..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                            className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all border-gray-200 bg-gray-50/30"
                        />
                    </div>
                    <div className="flex flex-col gap-1 w-full md:w-72">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Date Range</label>
                        <DateRangePicker
                            date={dateRange}
                            setDate={(range) => {
                                setDateRange(range);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 p-1 bg-gray-50 w-fit rounded-2xl border border-gray-100">
                    {(["ALL", "ACTIVE", "COMPLETED", "OVERDUE"] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => {
                                setStatusFilter(status);
                                setPage(1);
                            }}
                            className={`px-6 py-2 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all ${statusFilter === status
                                ? "bg-white text-purple-700 shadow-sm border border-purple-100"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="w-full overflow-hidden rounded-2xl border bg-white/60 backdrop-blur-md shadow-sm">
                    <div className="p-4">
                        <TableSkeleton columns={7} rows={8} />
                    </div>
                </div>
            ) : (
                <div className="w-full overflow-hidden rounded-2xl border bg-white/60 backdrop-blur-md shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                    <th className="px-6 py-4">ID & Date</th>
                                    <th className="px-6 py-4">Vendor</th>
                                    <th className="px-6 py-4">Department</th>
                                    <th className="px-6 py-4">Items</th>
                                    <th className="px-6 py-4 text-center">Type</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4">Timeline</th>
                                    <th className="px-6 py-4">Remarks</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedTransactions.map((transaction: Transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="group transition-colors hover:bg-white/80"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-mono text-[10px] text-gray-400">
                                                    #{transaction.id.slice(0, 8)}
                                                </span>
                                                <span className="text-xs font-medium text-gray-600">
                                                    {new Date(transaction.createdAt).toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-semibold text-gray-900">{transaction.vendor.name}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-medium text-purple-700">{transaction.department.name}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                                                {transaction.items.map((it: any) => (
                                                    <span
                                                        key={it.item.id}
                                                        className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100/80 text-gray-600 rounded-md border border-gray-200"
                                                    >
                                                        {it.item.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${transaction.isReturnable
                                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                }`}>
                                                {transaction.isReturnable ? "Returnable" : "Consumable"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${transaction.status === 'COMPLETED'
                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                : new Date(transaction.expectedReturnDate!) < new Date() && transaction.status === 'ACTIVE'
                                                    ? "bg-rose-50 text-rose-600 border border-rose-100 animate-pulse"
                                                    : "bg-purple-50 text-purple-600 border border-purple-100"
                                                }`}>
                                                {transaction.status === 'COMPLETED' ? 'Completed' : (new Date(transaction.expectedReturnDate!) < new Date() ? 'Overdue' : 'Active')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                {transaction.isReturnable && (
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs font-semibold text-gray-700">
                                                            {new Date(transaction.expectedReturnDate!).toLocaleDateString(undefined, {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-medium">Expected Return</span>
                                                    </div>
                                                )}
                                                {transaction.actualReturnDate && (
                                                    <div className="flex flex-col gap-0.5 border-t pt-1 border-gray-100">
                                                        <span className="text-xs font-semibold text-emerald-600">
                                                            {new Date(transaction.actualReturnDate).toLocaleDateString(undefined, {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                        <span className="text-[10px] text-emerald-400 font-medium font-mono lowercase">actual return</span>
                                                    </div>
                                                )}
                                                {!transaction.isReturnable && <span className="text-gray-300 text-xs">-</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]" title={transaction.remarks || ""}>
                                                {transaction.remarks || "-"}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-1 items-center">
                                                {transaction.status === 'ACTIVE' && (
                                                    <Button
                                                        onClick={() => handleReturn(transaction)}
                                                        className="mr-2 h-9 px-4 text-xs font-semibold shadow-sm hover:shadow-md transition-all whitespace-nowrap"
                                                    >
                                                        Mark Returned
                                                    </Button>
                                                )}
                                                <button
                                                    onClick={() => handleEdit(transaction)}
                                                    className="rounded-lg p-2 text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Pagination
                page={page}
                pageSize={pageSize}
                total={filteredTransactions.length}
                onPageChange={setPage}
            />

            {isFetched && filteredTransactions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white/40 rounded-3xl border border-dashed">
                    <div className="h-16 w-16 mb-4 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your filters or record a new entry</p>
                </div>
            )}

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={selectedTransaction}
                title={selectedTransaction ? "Edit Record" : "New Transaction"}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
                error={
                    (createMutation.error as any)?.response?.data?.message ||
                    (updateMutation.error as any)?.response?.data?.message ||
                    null
                }
            />
            <ReturnModal
                isOpen={isReturnModalOpen}
                onClose={() => setIsReturnModalOpen(false)}
                onSubmit={handleReturnSubmit}
                isSubmitting={returnMutation.isPending}
            />
        </div>
    );
}
