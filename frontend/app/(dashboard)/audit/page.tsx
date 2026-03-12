"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/lib/api/audit";

import { Activity, ShieldCheck, ChevronDown, Clock, Box, UserCheck } from "lucide-react";
import { useMemo, useState, Fragment } from "react";
import { Pagination } from "@/components/Pagination";
import { TableSkeleton } from "@/components/TableSkeleton";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";

export default function AuditLogsPage() {
    const [expandedIds, setExpandedIds] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [page, setPage] = useState(1);
    const pageSize = 15;

    const { data: logs, isLoading } = useQuery({
        queryKey: ["audit-logs"],
        queryFn: () => getAuditLogs(),
    });

    const getActionColor = (action: string) => {
        switch (action.toUpperCase()) {
            case "CREATE": return "border-emerald-200 bg-emerald-50 text-emerald-700";
            case "UPDATE": return "border-amber-200 bg-amber-50 text-amber-700";
            case "DELETE": return "border-rose-200 bg-rose-50 text-rose-700";
            default: return "border-border bg-muted text-muted-foreground";
        }
    };

    const getStateTone = (action: string, type: "previous" | "current") => {
        if (action === "DELETE") {
            return type === "previous"
                ? "border-rose-200 bg-rose-50/80"
                : "border-rose-100 bg-rose-50/45";
        }

        if (action === "CREATE") {
            return type === "previous"
                ? "border-emerald-100 bg-emerald-50/45"
                : "border-emerald-200 bg-emerald-50/80";
        }

        return type === "previous"
            ? "border-amber-200 bg-amber-50/75"
            : "border-emerald-200 bg-emerald-50/75";
    };

    const toggleExpand = (id: string) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const renderValue = (val: unknown) => {
        if (val === null || val === undefined) return <span className="text-gray-300 italic">null</span>;
        if (typeof val === "object") return JSON.stringify(val, null, 2);
        return String(val);
    };

    const getDelta = (oldValue: unknown, newValue: unknown) => {
        if (!oldValue || !newValue || typeof oldValue !== "object" || typeof newValue !== "object") {
            return null;
        }

        const keys = Array.from(
            new Set([
                ...Object.keys(oldValue as Record<string, unknown>),
                ...Object.keys(newValue as Record<string, unknown>),
            ]),
        );

        const changes = keys
            .filter((key) => {
                const before = (oldValue as Record<string, unknown>)[key];
                const after = (newValue as Record<string, unknown>)[key];
                return JSON.stringify(before) !== JSON.stringify(after);
            })
            .map((key) => ({
                key,
                before: (oldValue as Record<string, unknown>)[key],
                after: (newValue as Record<string, unknown>)[key],
            }));

        return changes.length ? changes : null;
    };

    const filteredLogs = useMemo(() => {
        if (!logs) return [];

        const startDate: Date | null = dateRange?.from || null;
        let endExclusive: Date | null = null;

        if (dateRange?.to) {
            endExclusive = new Date(dateRange.to.getTime() + 24 * 60 * 60 * 1000);
        }

        return logs.filter((log) => {
            const createdAt = new Date(log.createdAt);

            if (startDate && createdAt < startDate) return false;
            if (endExclusive && createdAt >= endExclusive) return false;

            return true;
        });
    }, [logs, dateRange]);

    const paginatedLogs = useMemo(() => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return filteredLogs.slice(start, end);
    }, [filteredLogs, page, pageSize]);

    return (
        <div className="page-shell relative space-y-8 overflow-hidden font-[family-name:var(--font-geist-sans)]">


            <div className="flex flex-col gap-3 text-left md:flex-row md:items-end md:justify-between">
                <div className="flex items-center gap-3">
                    <div className="soft-icon-chip h-14 w-14 bg-secondary">
                        <ShieldCheck className="w-7 h-7 text-foreground" />
                    </div>
                    <div>
                        <h1 className="page-title leading-tight">Audit Logs</h1>
                        <p className="page-subtitle">A complete history of all activities and changes</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <div className="flex flex-col gap-1 w-full md:w-72">
                        <label className="control-label">
                            Date Range
                        </label>
                        <DateRangePicker
                            date={dateRange}
                            setDate={(range) => {
                                setDateRange(range);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="table-shell">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="table-head">
                                <th className="px-8 py-5">Activity</th>
                                <th className="px-6 py-5">Performed By</th>
                                <th className="px-8 py-5 text-right font-bold">Date & Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="p-6">
                                        <TableSkeleton columns={3} rows={6} />
                                    </td>
                                </tr>
                            ) : (
                                paginatedLogs.map((log) => {
                                    const isExpanded = expandedIds.includes(log.id);
                                    return (
                                        <Fragment key={log.id}>
                                            <tr
                                                key={log.id}
                                                onClick={() => toggleExpand(log.id)}
                                                className={`group cursor-pointer transition-all duration-300 hover:bg-secondary/20 ${isExpanded ? 'relative z-10 bg-card shadow-[0_18px_36px_-24px_rgba(2,43,58,0.16)]' : ''}`}
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2 rounded-xl border transition-colors ${getActionColor(log.action)}`}>
                                                            {log.action === "CREATE" ? <Box className="w-4 h-4" /> :
                                                                log.action === "UPDATE" ? <Activity className="w-4 h-4" /> :
                                                                    <Clock className="w-4 h-4" />}
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border w-fit ${getActionColor(log.action)}`}>
                                                                {log.action}
                                                            </span>
                                                            <span className="mt-1 text-xs font-bold uppercase tracking-tight text-foreground">{log.entityType}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="soft-icon-chip h-8 w-8 bg-secondary text-muted-foreground transition-colors group-hover:text-foreground">
                                                            <UserCheck className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-foreground/80">{log.performedBy?.email || "System-Admin"}</span>
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                                                IP {log.ipAddress || "Unavailable"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right tabular-nums">
                                                    <div className="flex items-center justify-end gap-6 text-right">
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="text-xs font-bold text-foreground/85">
                                                                {new Date(log.createdAt).toLocaleDateString(undefined, {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                                {new Date(log.createdAt).toLocaleTimeString(undefined, {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-primary' : 'text-muted-foreground/50'}`}>
                                                            <ChevronDown className="w-5 h-5 ml-2" />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr key={`${log.id}-details`} className="bg-card">
                                                    <td colSpan={3} className="border-b border-border/60 px-8 py-8">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                                            <div className="space-y-4">
                                                                <h4 className="ml-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                                    <div className={`h-1.5 w-1.5 rounded-full ${log.action === "DELETE" ? "bg-rose-500" : log.action === "CREATE" ? "bg-emerald-500" : "bg-amber-500"}`} />
                                                                    Previous State
                                                                </h4>
                                                                <div className={`rounded-3xl border p-6 ${getStateTone(log.action, "previous")}`}>
                                                                    {log.action === "UPDATE" && log.oldValue && log.newValue ? (
                                                                        (() => {
                                                                            const delta = getDelta(log.oldValue, log.newValue);
                                                                            if (!delta) {
                                                                                return (
                                                                                    <div className="text-[11px] italic text-muted-foreground">
                                                                                        No field-level changes detected
                                                                                    </div>
                                                                                );
                                                                            }
                                                                            return (
                                                                                <div className="space-y-3">
                                                                                    {delta.map(({ key, before }) => (
                                                                                        <div
                                                                                            key={key}
                                                                                            className="flex flex-col gap-1 border-b border-border/50 pb-2 last:border-0 last:pb-0"
                                                                                        >
                                                                                            <span className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground">
                                                                                                {key}
                                                                                            </span>
                                                                                            <span className="text-[11px] font-bold break-all text-foreground">
                                                                                                {renderValue(before)}
                                                                                            </span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            );
                                                                        })()
                                                                    ) : log.oldValue ? (
                                                                        <div className="space-y-3">
                                                                            {Object.entries(log.oldValue as object).map(([key, val]) => (
                                                                                <div
                                                                                    key={key}
                                                                                    className="flex flex-col gap-1 border-b border-border/50 pb-2 last:border-0 last:pb-0"
                                                                                >
                                                                                    <span className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground">
                                                                                        {key}
                                                                                    </span>
                                                                                    <span className="text-[11px] font-bold break-all text-foreground">
                                                                                        {renderValue(val)}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                                                                            <ShieldCheck className="w-6 h-6 text-emerald-300" />
                                                                            <span className="text-[11px] font-bold uppercase italic text-muted-foreground">Entry Created</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <h4 className="ml-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                                    <div className={`h-1.5 w-1.5 rounded-full ${log.action === "DELETE" ? "bg-rose-500" : log.action === "CREATE" ? "bg-emerald-500" : "bg-amber-500"}`} />
                                                                    Current State
                                                                </h4>
                                                                <div className={`rounded-3xl border p-6 ${getStateTone(log.action, "current")}`}>
                                                                    {log.action === "UPDATE" && log.oldValue && log.newValue ? (
                                                                        (() => {
                                                                            const delta = getDelta(log.oldValue, log.newValue);
                                                                            if (!delta) {
                                                                                return (
                                                                                    <div className="text-[11px] italic text-muted-foreground">
                                                                                        No field-level changes detected
                                                                                    </div>
                                                                                );
                                                                            }
                                                                            return (
                                                                                <div className="space-y-3">
                                                                                    {delta.map(({ key, after }) => (
                                                                                        <div
                                                                                            key={key}
                                                                                            className="flex flex-col gap-1 border-b border-border/50 pb-2 last:border-0 last:pb-0"
                                                                                        >
                                                                                            <span className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground">
                                                                                                {key}
                                                                                            </span>
                                                                                            <span className="text-[11px] font-bold break-all text-foreground">
                                                                                                {renderValue(after)}
                                                                                            </span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            );
                                                                        })()
                                                                    ) : log.newValue ? (
                                                                        <div className="space-y-3">
                                                                            {Object.entries(log.newValue as object).map(([key, val]) => (
                                                                                <div
                                                                                    key={key}
                                                                                    className="flex flex-col gap-1 border-b border-border/50 pb-2 last:border-0 last:pb-0"
                                                                                >
                                                                                    <span className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground">
                                                                                        {key}
                                                                                    </span>
                                                                                    <span className="text-[11px] font-bold break-all text-foreground">
                                                                                        {renderValue(val)}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                                                                            <Clock className="w-6 h-6 text-rose-300" />
                                                                            <span className="text-[11px] font-bold uppercase italic text-muted-foreground">Entry Deleted</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination
                page={page}
                pageSize={pageSize}
                total={filteredLogs.length}
                onPageChange={setPage}
            />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center mt-4">Audit Access Log • {new Date().getFullYear()}</p>
        </div>
    );
}
