"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, Transaction } from "@/lib/api/transactions";
import { useState, useMemo } from "react";
import { TransactionModal } from "@/components/TransactionModal";
import { Button } from "@/components/ui/button";
import { BackgroundGradients } from "@/components/BackgroundGradients";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/Pagination";
import { TableSkeleton } from "@/components/TableSkeleton";

export default function TransactionsPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const deleteMutation = useMutation({
        mutationFn: deleteTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
        },
    });

    const filteredTransactions = useMemo(() => {
        const q = searchQuery.toLowerCase();

        let startDate: Date | null = null;
        let endExclusive: Date | null = null;

        if (fromDate) {
            startDate = new Date(fromDate);
        }
        if (toDate) {
            const d = new Date(toDate);
            endExclusive = new Date(d.getTime() + 24 * 60 * 60 * 1000);
        }

        return transactions.filter((t: Transaction) => {
            const createdAt = new Date(t.createdAt);

            if (startDate && createdAt < startDate) return false;
            if (endExclusive && createdAt >= endExclusive) return false;

            if (!q) return true;

            return (
                t.vendor.name.toLowerCase().includes(q) ||
                t.department.name.toLowerCase().includes(q) ||
                t.remarks?.toLowerCase().includes(q)
            );
        });
    }, [transactions, searchQuery, fromDate, toDate]);

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

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this transaction record?")) {
            deleteMutation.mutate(id);
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
        <div className="relative min-h-[calc(100vh-100px)] space-y-8 p-4 md:p-8 overflow-hidden">
            <BackgroundGradients />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 leading-tight">Transactions</h1>
                    <p className="text-sm text-muted-foreground mt-1">Monitor inward and outward item movements</p>
                </div>
                <Button
                    onClick={handleAdd}
                    className="w-full sm:w-auto rounded-xl bg-purple-800 px-6 py-6 text-white hover:bg-purple-900 transition shadow-lg shadow-purple-900/10"
                >
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Record Transaction
                </Button>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="relative flex-1">
                    <svg
                        className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by vendor, department or remarks..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                        className="w-full rounded-2xl border bg-white/60 backdrop-blur-sm px-11 py-3.5 text-sm ring-offset-background transition-all focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                </div>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                            From
                        </label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => {
                                setFromDate(e.target.value);
                                setPage(1);
                            }}
                            className="w-full md:w-auto rounded-2xl border bg-white/60 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                            To
                        </label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => {
                                setToDate(e.target.value);
                                setPage(1);
                            }}
                            className="w-full md:w-auto rounded-2xl border bg-white/60 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="w-full overflow-hidden rounded-2xl border bg-white/60 backdrop-blur-md shadow-sm">
                    <div className="p-4">
                        <TableSkeleton columns={6} rows={8} />
                    </div>
                </div>
            ) : (
                <div className="w-full overflow-hidden rounded-2xl border bg-white/60 backdrop-blur-md shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                    <th className="px-6 py-4">ID & Date</th>
                                    <th className="px-6 py-4">Source / Destination</th>
                                    <th className="px-6 py-4">Items</th>
                                    <th className="px-6 py-4">Type</th>
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
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-semibold text-gray-900">{transaction.vendor.name}</span>
                                                <svg className="h-3 w-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                                <span className="font-medium text-purple-700">{transaction.department.name}</span>
                                            </div>
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
                                        <td className="px-6 py-5 text-sm">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${transaction.isReturnable
                                                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                                                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                }`}>
                                                {transaction.isReturnable ? "Returnable" : "Non-Returnable"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]" title={transaction.remarks || ""}>
                                                {transaction.remarks || "-"}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => handleEdit(transaction)}
                                                    className="rounded-lg p-2 text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(transaction.id)}
                                                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
        </div>
    );
}
