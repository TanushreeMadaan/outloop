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
            case "CREATE": return "bg-[rgba(222,238,228,0.86)] text-[rgb(86,140,112)] border-white/70";
            case "UPDATE": return "bg-[rgba(248,232,207,0.86)] text-[rgb(176,131,82)] border-white/70";
            case "DELETE": return "bg-[rgba(246,221,223,0.88)] text-[rgb(170,97,112)] border-white/70";
            default: return "bg-[rgba(246,244,249,0.88)] text-muted-foreground border-white/70";
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const renderValue = (val: any) => {
        if (val === null || val === undefined) return <span className="text-gray-300 italic">null</span>;
        if (typeof val === "object") return JSON.stringify(val, null, 2);
        return String(val);
    };

    const getDelta = (oldValue: any, newValue: any) => {
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
                    <div className="soft-icon-chip h-14 w-14">
                        <ShieldCheck className="w-7 h-7 text-[rgb(104,114,176)]" />
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
                                                className={`group cursor-pointer transition-all duration-300 hover:bg-white/72 ${isExpanded ? 'relative z-10 bg-white/90 shadow-[0_24px_48px_-40px_rgba(118,112,156,0.55)]' : ''}`}
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
                                                        <div className="soft-icon-chip h-8 w-8 text-muted-foreground transition-colors group-hover:text-[rgb(104,114,176)]">
                                                            <UserCheck className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-foreground/80">{log.performedBy?.email || "System-Admin"}</span>
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Verified User</span>
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
                                                        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[rgb(104,114,176)]' : 'text-muted-foreground/50'}`}>
                                                            <ChevronDown className="w-5 h-5 ml-2" />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr key={`${log.id}-details`} className="bg-white/45">
                                                    <td colSpan={3} className="border-b border-border/60 px-8 py-8">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                                            <div className="space-y-4">
                                                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                                    Previous State
                                                                </h4>
                                                                <div className="p-6 rounded-3xl bg-red-50/30 border border-red-100/50 backdrop-blur-sm">
                                                                    {log.action === "UPDATE" && log.oldValue && log.newValue ? (
                                                                        (() => {
                                                                            const delta = getDelta(log.oldValue, log.newValue);
                                                                            if (!delta) {
                                                                                return (
                                                                                    <div className="text-[11px] text-red-300 italic">
                                                                                        No field-level changes detected
                                                                                    </div>
                                                                                );
                                                                            }
                                                                            return (
                                                                                <div className="space-y-3">
                                                                                    {delta.map(({ key, before }) => (
                                                                                        <div
                                                                                            key={key}
                                                                                            className="flex flex-col gap-1 border-b border-red-100/20 pb-2 last:border-0 last:pb-0"
                                                                                        >
                                                                                            <span className="text-[9px] font-bold text-red-400 uppercase tracking-tight">
                                                                                                {key}
                                                                                            </span>
                                                                                            <span className="text-[11px] font-bold text-red-900 break-all">
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
                                                                                    className="flex flex-col gap-1 border-b border-red-100/20 pb-2 last:border-0 last:pb-0"
                                                                                >
                                                                                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-tight">
                                                                                        {key}
                                                                                    </span>
                                                                                    <span className="text-[11px] font-bold text-red-900 break-all">
                                                                                        {renderValue(val)}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                                                                            <ShieldCheck className="w-6 h-6 text-red-200" />
                                                                            <span className="text-[11px] font-bold text-red-300 uppercase italic">Entry Created</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                                    Current State
                                                                </h4>
                                                                <div className="p-6 rounded-3xl bg-emerald-50/30 border border-emerald-100/50 backdrop-blur-sm">
                                                                    {log.action === "UPDATE" && log.oldValue && log.newValue ? (
                                                                        (() => {
                                                                            const delta = getDelta(log.oldValue, log.newValue);
                                                                            if (!delta) {
                                                                                return (
                                                                                    <div className="text-[11px] text-emerald-300 italic">
                                                                                        No field-level changes detected
                                                                                    </div>
                                                                                );
                                                                            }
                                                                            return (
                                                                                <div className="space-y-3">
                                                                                    {delta.map(({ key, after }) => (
                                                                                        <div
                                                                                            key={key}
                                                                                            className="flex flex-col gap-1 border-b border-emerald-100/20 pb-2 last:border-0 last:pb-0"
                                                                                        >
                                                                                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tight">
                                                                                                {key}
                                                                                            </span>
                                                                                            <span className="text-[11px] font-bold text-emerald-900 break-all">
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
                                                                                    className="flex flex-col gap-1 border-b border-emerald-100/20 pb-2 last:border-0 last:pb-0"
                                                                                >
                                                                                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tight">
                                                                                        {key}
                                                                                    </span>
                                                                                    <span className="text-[11px] font-bold text-emerald-900 break-all">
                                                                                        {renderValue(val)}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                                                                            <Clock className="w-6 h-6 text-emerald-200" />
                                                                            <span className="text-[11px] font-bold text-emerald-300 uppercase italic">Entry Deleted</span>
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
