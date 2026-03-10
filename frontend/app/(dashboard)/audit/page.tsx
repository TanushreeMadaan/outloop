"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/lib/api/audit";

import { Calendar, User, Activity, ShieldCheck, ChevronDown, ChevronUp, ArrowRight, Clock, Box, HardDrive, UserCheck } from "lucide-react";
import { useMemo, useState } from "react";
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
            case "CREATE": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "UPDATE": return "bg-amber-50 text-amber-600 border-amber-100";
            case "DELETE": return "bg-red-50 text-red-600 border-red-100";
            default: return "bg-gray-50 text-gray-600 border-gray-100";
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

        let startDate: Date | null = dateRange?.from || null;
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
        <div className="relative min-h-[calc(100vh-100px)] space-y-8 p-4 md:p-8 overflow-hidden font-[family-name:var(--font-geist-sans)]">


            <div className="flex flex-col gap-3 text-left md:flex-row md:items-end md:justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/50 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-sm">
                        <ShieldCheck className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 leading-tight">Audit Logs</h1>
                        <p className="text-sm text-muted-foreground font-medium">A complete history of all activities and changes</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <div className="flex flex-col gap-1 w-full md:w-72">
                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest ml-1">
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

            <div className="w-full overflow-hidden rounded-3xl border bg-white/60 backdrop-blur-md shadow-xl border-gray-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b bg-gray-50/50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                <th className="px-8 py-5">Activity</th>
                                <th className="px-6 py-5">Performed By</th>
                                <th className="px-8 py-5 text-right font-bold">Date & Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
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
                                        <>
                                            <tr
                                                key={log.id}
                                                onClick={() => toggleExpand(log.id)}
                                                className={`group cursor-pointer transition-all duration-300 hover:bg-white ${isExpanded ? 'bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] z-10 relative' : ''}`}
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
                                                            <span className="text-xs font-bold text-gray-900 mt-1 uppercase tracking-tight">{log.entityType}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                                                            <UserCheck className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-gray-700">{log.performedBy?.email || "System-Admin"}</span>
                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Verified User</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right tabular-nums">
                                                    <div className="flex items-center justify-end gap-6 text-right">
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="text-xs font-bold text-gray-800">
                                                                {new Date(log.createdAt).toLocaleDateString(undefined, {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                                {new Date(log.createdAt).toLocaleTimeString(undefined, {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-purple-600' : 'text-gray-300'}`}>
                                                            <ChevronDown className="w-5 h-5 ml-2" />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr key={`${log.id}-details`} className="bg-white/40">
                                                    <td colSpan={3} className="px-8 py-8 border-b border-gray-100">
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
                                        </>
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
