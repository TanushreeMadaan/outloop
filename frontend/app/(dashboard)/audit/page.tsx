"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/lib/api/audit";
import { BackgroundGradients } from "@/components/BackgroundGradients";
import { ItemSkeleton } from "@/components/ItemSkeleton";
import { Calendar, User, Activity, ShieldCheck } from "lucide-react";

export default function AuditLogsPage() {
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

    return (
        <div className="relative min-h-[calc(100vh-100px)] space-y-8 p-4 md:p-8 overflow-hidden font-[family-name:var(--font-geist-sans)]">
            <BackgroundGradients />

            <div className="flex flex-col gap-1 text-left">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 leading-tight">System Audit</h1>
                        <p className="text-sm text-muted-foreground">Immutable record of all system modifications</p>
                    </div>
                </div>
            </div>

            <div className="w-full overflow-hidden rounded-2xl border bg-white/60 backdrop-blur-md shadow-sm border-gray-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b bg-gray-50/50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                <th className="px-6 py-4">Action & Entity</th>
                                <th className="px-6 py-4 text-center">Entity ID</th>
                                <th className="px-6 py-4">Performed By</th>
                                <th className="px-6 py-4 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="p-8"><ItemSkeleton /></td>
                                </tr>
                            ) : (
                                logs?.map((log) => (
                                    <tr key={log.id} className="group transition-colors hover:bg-white/80">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight border ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{log.entityType}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-mono text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                                {log.entityId.slice(0, 8)}...
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <User className="w-3 h-3" />
                                                </div>
                                                <span className="text-xs font-semibold text-gray-600">Admin Account</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right tabular-nums">
                                            <div className="flex flex-col items-end gap-0.5">
                                                <span className="text-xs font-bold text-gray-700">
                                                    {new Date(log.createdAt).toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {new Date(log.createdAt).toLocaleTimeString(undefined, {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
