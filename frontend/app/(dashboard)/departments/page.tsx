"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "@/lib/api/departments";
import { BackgroundGradients } from "@/components/BackgroundGradients";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Store, Calendar, ArrowRight, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { ItemSkeleton } from "@/components/ItemSkeleton";
import { Department } from "@/types";

export default function DepartmentsPage() {
    const queryClient = useQueryClient();
    const [newName, setNewName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: departments, isLoading } = useQuery({
        queryKey: ["departments"],
        queryFn: getDepartments,
    });

    const createMutation = useMutation({
        mutationFn: createDepartment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            setNewName("");
            setIsSubmitting(false);
        },
        onError: () => {
            setIsSubmitting(false);
            alert("Failed to create department");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) => updateDepartment(id, { name }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            setEditingId(null);
        },
        onError: () => {
            alert("Failed to update department");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteDepartment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            setDeletingId(null);
        },
        onError: () => {
            alert("Failed to delete department");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setIsSubmitting(true);
        createMutation.mutate({ name: newName });
    };

    const handleStartEdit = (dept: Department) => {
        setEditingId(dept.id);
        setEditName(dept.name);
    };

    const handleUpdate = () => {
        if (!editName.trim() || !editingId) return;
        updateMutation.mutate({ id: editingId, name: editName });
    };

    return (
        <div className="relative min-h-[calc(100vh-100px)] space-y-8 p-4 md:p-8 overflow-hidden font-[family-name:var(--font-geist-sans)]">
            <BackgroundGradients />

            <div className="flex flex-col gap-1 text-left">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 leading-tight">Departments</h1>
                        <p className="text-sm text-muted-foreground">Manage organizational units and distribution centers</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-4">
                {/* Add Form */}
                <Card className="lg:col-span-1 h-fit overflow-hidden rounded-2xl border bg-white/70 backdrop-blur-md shadow-sm border-purple-100/50">
                    <CardContent className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-purple-600" />
                            New Unit
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5 text-left">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Department Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g. Logistics, Food Court"
                                    className="w-full rounded-xl border bg-white/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all border-gray-100"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !newName.trim()}
                                className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 shadow-sm transition-all"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Department"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* List */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Store className="w-5 h-5 text-purple-600" />
                            Existing Units
                        </h2>
                        <span className="text-xs font-medium text-gray-400">
                            {departments?.length || 0} Total Departments
                        </span>
                    </div>

                    {isLoading ? (
                        <ItemSkeleton />
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {departments?.map((dept) => (
                                <Card key={dept.id} className="group overflow-hidden rounded-2xl border bg-white/60 backdrop-blur-md transition-all hover:shadow-xl hover:shadow-purple-900/5 border-gray-100 relative">
                                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {editingId === dept.id ? (
                                            <>
                                                <button onClick={handleUpdate} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </>
                                        ) : deletingId === dept.id ? (
                                            <>
                                                <button onClick={() => deleteMutation.mutate(dept.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => setDeletingId(null)} className="p-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleStartEdit(dept)} className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all">
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => setDeletingId(dept.id)} className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <CardContent className="p-5 flex flex-col gap-4">
                                        <div className="flex flex-col gap-0.5 text-left">
                                            {editingId === dept.id ? (
                                                <input
                                                    autoFocus
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                                                    className="text-sm font-bold text-gray-900 bg-purple-50/50 border-b border-purple-200 focus:outline-none w-full py-0.5 px-1 rounded"
                                                />
                                            ) : (
                                                <span className={`text-sm font-bold text-gray-900 transition-opacity ${deletingId === dept.id ? 'opacity-30' : ''}`}>
                                                    {dept.name}
                                                </span>
                                            )}

                                            <div className="flex items-center gap-3 mt-1">
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(dept.createdAt).toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                                                ID: {dept.id.slice(0, 8)}
                                            </span>
                                            {deletingId === dept.id && (
                                                <span className="text-[10px] font-bold text-red-500 animate-pulse">
                                                    Confirm Delete?
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
