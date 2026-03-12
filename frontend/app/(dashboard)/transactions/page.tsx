"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTransactions, createTransaction, updateTransaction, markAsReturned } from "@/lib/api/transactions";
import { useState, useMemo } from "react";
import { TransactionModal } from "@/components/TransactionModal";
import { ReturnModal } from "@/components/ReturnModal";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Transaction } from "@/types";
import { Pagination } from "@/components/Pagination";
import { TableSkeleton } from "@/components/TableSkeleton";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { getMe } from "@/lib/api/auth";

function formatDate(date?: string) {
    if (!date) return "-";
    return new Date(date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function isTransactionOverdue(transaction: Transaction) {
    return transaction.status === "ACTIVE" && transaction.expectedReturnDate && new Date(transaction.expectedReturnDate) < new Date();
}

function statusLabel(transaction: Transaction) {
    if (transaction.status === "COMPLETED") return "Completed";
    return isTransactionOverdue(transaction) ? "Overdue" : "Active";
}

function itemSummary(items: Transaction["items"]) {
    if (items.length === 0) return { primary: "No items", remaining: 0 };
    return {
        primary: items[0].item.name,
        remaining: Math.max(0, items.length - 1),
    };
}

export default function TransactionsPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED" | "OVERDUE">("ALL");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [detailsTransaction, setDetailsTransaction] = useState<Transaction | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { data: user, isLoading: isLoadingUser } = useQuery({
        queryKey: ["me"],
        queryFn: getMe,
    });

    const { data: transactionsRes, isLoading, isFetched } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => getTransactions(),
    });

    const transactions = useMemo(() => transactionsRes?.data ?? [], [transactionsRes?.data]);

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
        const userDepartmentId = user?.departmentId ?? user?.department?.id;
        const userDepartmentName = user?.department?.name?.toLowerCase();

        const startDate: Date | null = dateRange?.from || null;
        let endExclusive: Date | null = null;

        if (dateRange?.to) {
            endExclusive = new Date(dateRange.to.getTime() + 24 * 60 * 60 * 1000);
        }

        return transactions.filter((t: Transaction) => {
            if (!user) return false;
            if (user.role !== "ADMIN") {
                const sameDepartmentById = Boolean(userDepartmentId && t.departmentId === userDepartmentId);
                const sameDepartmentByName = Boolean(
                    userDepartmentName &&
                    t.department?.name &&
                    t.department.name.toLowerCase() === userDepartmentName
                );

                if (!sameDepartmentById && !sameDepartmentByName) {
                    return false;
                }
            }

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
    }, [transactions, searchQuery, dateRange, statusFilter, user]);

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

    const handleViewDetails = (transaction: Transaction) => {
        setDetailsTransaction(transaction);
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
        <div className="page-shell">

            <div className="page-header">
                <div>
                    <h1 className="page-title">Transactions</h1>
                    <p className="page-subtitle">Monitor inward and outward item movements</p>
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
                        <div className="relative">
                            <Search className="control-input-icon" />
                            <input
                                type="text"
                                placeholder="Search by vendor, department or remarks..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(1);
                                }}
                                className="control-input control-input-with-icon h-14 font-medium"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 w-full md:w-72">
                        <label className="control-label">Date Range</label>
                        <DateRangePicker
                            date={dateRange}
                            setDate={(range) => {
                                setDateRange(range);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>

                <div className="filter-rail">
                    {(["ALL", "ACTIVE", "COMPLETED", "OVERDUE"] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => {
                                setStatusFilter(status);
                                setPage(1);
                            }}
                            className={`filter-pill ${statusFilter === status
                                ? "filter-pill-active"
                                : "hover:text-foreground"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading || isLoadingUser ? (
                <div className="table-shell">
                    <div className="p-4">
                        <TableSkeleton columns={7} rows={8} />
                    </div>
                </div>
            ) : (
                <div className="table-shell">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="table-head">
                                    <th className="px-6 py-4">ID & Date</th>
                                    <th className="px-6 py-4">Department</th>
                                    <th className="px-6 py-4">Items</th>
                                    <th className="px-6 py-4 text-center">Type</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4">Timeline</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {paginatedTransactions.map((transaction: Transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="table-row group"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-mono text-[10px] text-muted-foreground">
                                                    #{transaction.id.slice(0, 8)}
                                                </span>
                                                <span className="text-xs font-medium text-foreground/78">
                                                    {new Date(transaction.createdAt).toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-medium text-primary">{transaction.department.name}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex max-w-[220px] flex-wrap items-center gap-2">
                                                <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-foreground/72">
                                                    {itemSummary(transaction.items).primary}
                                                </span>
                                                {itemSummary(transaction.items).remaining > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewDetails(transaction)}
                                                        className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[10px] font-semibold text-foreground/72 transition hover:bg-muted"
                                                    >
                                                        +{itemSummary(transaction.items).remaining} items
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`status-pill ${transaction.isReturnable
                                                ? "bg-secondary text-foreground"
                                                : "bg-muted text-foreground"
                                                }`}>
                                                {transaction.isReturnable ? "Returnable" : "Consumable"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`status-pill ${transaction.status === 'COMPLETED'
                                                ? "bg-secondary text-foreground"
                                                : isTransactionOverdue(transaction)
                                                    ? "animate-pulse bg-primary text-white"
                                                    : "bg-[#E1E5F2] text-foreground"
                                                }`}>
                                                {statusLabel(transaction)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                {transaction.isReturnable && (
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs font-semibold text-foreground/78">
                                                            {new Date(transaction.expectedReturnDate!).toLocaleDateString(undefined, {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-muted-foreground">Expected Return</span>
                                                    </div>
                                                )}
                                                {transaction.actualReturnDate && (
                                                    <div className="flex flex-col gap-0.5 border-t border-border/60 pt-1">
                                                        <span className="text-xs font-semibold text-primary">
                                                            {new Date(transaction.actualReturnDate).toLocaleDateString(undefined, {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                        <span className="text-[10px] font-mono font-medium lowercase text-primary">actual return</span>
                                                    </div>
                                                )}
                                                {!transaction.isReturnable && <span className="text-xs text-muted-foreground/60">-</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => handleViewDetails(transaction)}
                                                    className="h-9 px-3 text-xs font-semibold"
                                                >
                                                    View Details
                                                </Button>
                                                {transaction.status === 'ACTIVE' && (
                                                    <Button
                                                        onClick={() => handleReturn(transaction)}
                                                        className="mr-2 h-9 whitespace-nowrap px-4 text-xs font-semibold"
                                                    >
                                                        Mark Returned
                                                    </Button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(transaction)}
                                                    className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
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
                <div className="empty-state">
                    <div className="soft-icon-chip mb-4 h-16 w-16 text-muted-foreground">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-foreground">No transactions found</h3>
                    <p className="mt-1 text-muted-foreground">Try adjusting your filters or record a new entry</p>
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
            <Dialog open={Boolean(detailsTransaction)} onOpenChange={(open) => !open && setDetailsTransaction(null)}>
                <DialogContent className="sm:max-w-[680px]">
                    {detailsTransaction && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Transaction Details</DialogTitle>
                                <DialogDescription>
                                    Full transaction context for {detailsTransaction.department.name}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-2 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div>
                                        <p className="control-label ml-0">Transaction ID</p>
                                        <p className="mt-1 font-mono text-sm text-foreground/80">{detailsTransaction.id}</p>
                                    </div>
                                    <div>
                                        <p className="control-label ml-0">Created</p>
                                        <p className="mt-1 text-sm font-medium text-foreground">{formatDate(detailsTransaction.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="control-label ml-0">Vendor</p>
                                        <p className="mt-1 text-sm font-medium text-foreground">{detailsTransaction.vendor.name}</p>
                                    </div>
                                    <div>
                                        <p className="control-label ml-0">Department</p>
                                        <p className="mt-1 text-sm font-medium text-foreground">{detailsTransaction.department.name}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="control-label ml-0">Type</p>
                                        <div className="mt-2">
                                            <span className={`status-pill ${detailsTransaction.isReturnable
                                                ? "bg-secondary text-foreground"
                                                : "bg-muted text-foreground"
                                                }`}>
                                                {detailsTransaction.isReturnable ? "Returnable" : "Consumable"}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="control-label ml-0">Status</p>
                                        <div className="mt-2">
                                            <span className={`status-pill ${detailsTransaction.status === 'COMPLETED'
                                                ? "bg-secondary text-foreground"
                                                : isTransactionOverdue(detailsTransaction)
                                                    ? "bg-primary text-white"
                                                    : "bg-[#E1E5F2] text-foreground"
                                                }`}>
                                                {statusLabel(detailsTransaction)}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="control-label ml-0">Expected Return</p>
                                        <p className="mt-1 text-sm font-medium text-foreground">{formatDate(detailsTransaction.expectedReturnDate)}</p>
                                    </div>
                                    <div>
                                        <p className="control-label ml-0">Actual Return</p>
                                        <p className="mt-1 text-sm font-medium text-foreground">{formatDate(detailsTransaction.actualReturnDate)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3 border-t border-border/60 pt-5">
                                <p className="control-label ml-0">Items</p>
                                <div className="flex flex-wrap gap-2">
                                    {detailsTransaction.items.map((entry) => (
                                        <span
                                            key={entry.item.id}
                                            className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground/72"
                                        >
                                            {entry.item.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2 border-t border-border/60 pt-5">
                                <p className="control-label ml-0">Remarks</p>
                                <p className="text-sm leading-6 text-muted-foreground">
                                    {detailsTransaction.remarks || "No remarks added."}
                                </p>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
