"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "@/lib/api/departments";

import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Store, Calendar, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { ItemSkeleton } from "@/components/ItemSkeleton";
import { Department } from "@/types";
import { Pagination } from "@/components/Pagination";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

export default function DepartmentsPage() {
    const queryClient = useQueryClient();
    const [newName, setNewName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 9;

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
            toast.success("Department created successfully");
        },
        onError: (error: any) => {
            setIsSubmitting(false);
            toast.error(error.response?.data?.message || "Failed to create department");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) => updateDepartment(id, { name }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            setEditingId(null);
            toast.success("Department updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update department");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteDepartment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            setDepartmentToDelete(null);
            toast.success("Department deleted successfully");
        },
        onError: (error: any) => {
            setDepartmentToDelete(null);
            toast.error(error.response?.data?.message || "Failed to delete department");
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

    const handleDelete = (dept: Department) => {
        if (dept.canDelete === false) {
            toast.error("This department is associated with transactions and cannot be deleted.");
            return;
        }
        setDepartmentToDelete(dept);
    };

    const handleUpdate = () => {
        if (!editName.trim() || !editingId) return;
        updateMutation.mutate({ id: editingId, name: editName });
    };

    const paginatedDepartments = (() => {
        const all = departments || [];
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return all.slice(start, end);
    })();

    return (
        <div className="page-shell">

            <div className="mb-6 flex flex-col gap-1">
                <div>
                    <h1 className="page-title">Departments</h1>
                    <p className="page-subtitle">Manage organizational units and distribution centers</p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-4">
                {/* Add Form */}
                <Card className="lg:col-span-1 h-fit overflow-hidden">
                    <CardContent className="p-6">
                        <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
                            <Plus className="w-5 h-5 text-[rgb(104,114,176)]" />
                            New Unit
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5 text-left">
                                <label className="control-label ml-0">Department Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g. Logistics, Food Court"
                                    className="control-input"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !newName.trim()}
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Create"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* List */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                            <Store className="w-5 h-5 text-[rgb(104,114,176)]" />
                            Existing Units
                        </h2>
                        <span className="text-xs font-medium text-muted-foreground">
                            {departments?.length || 0} Total Departments
                        </span>
                    </div>

                    {isLoading ? (
                        <ItemSkeleton />
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {paginatedDepartments.map((dept) => (
                                <Card key={dept.id} className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5">
                                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {editingId === dept.id ? (
                                            <>
                                                <button onClick={handleUpdate} className="rounded-full bg-[rgba(222,238,228,0.86)] p-1.5 text-[rgb(86,140,112)] transition-colors hover:bg-[rgba(222,238,228,1)]">
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="rounded-full bg-[rgba(246,244,249,0.88)] p-1.5 text-muted-foreground transition-colors hover:bg-white">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleStartEdit(dept)} className="rounded-full bg-[rgba(246,244,249,0.88)] p-1.5 text-muted-foreground transition-all hover:bg-[rgba(217,223,248,0.7)] hover:text-[rgb(104,114,176)]">
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDelete(dept)} className="rounded-full bg-[rgba(246,244,249,0.88)] p-1.5 text-muted-foreground transition-all hover:bg-[rgba(246,221,223,0.72)] hover:text-[rgb(170,97,112)]">
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
                                                    className="w-full rounded-md border-b border-[rgba(199,208,244,0.7)] bg-[rgba(217,223,248,0.45)] px-1 py-0.5 text-sm font-bold text-foreground focus:outline-none"
                                                />
                                            ) : (
                                                <span className="text-sm font-bold text-foreground transition-opacity">
                                                    {dept.name}
                                                </span>
                                            )}

                                            <div className="flex items-center gap-3 mt-1">
                                                <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(dept.createdAt).toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-border/60 pt-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                                                ID: {dept.id.slice(0, 8)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    <Pagination
                        page={page}
                        pageSize={pageSize}
                        total={departments?.length || 0}
                        onPageChange={setPage}
                    />
                </div>
            </div>

            <ConfirmDeleteDialog
                open={Boolean(departmentToDelete)}
                onOpenChange={(open) => {
                    if (!open) {
                        setDepartmentToDelete(null);
                    }
                }}
                title="Delete department?"
                description={`This will permanently remove ${departmentToDelete?.name || "this department"} if it is not linked to existing transactions.`}
                onConfirm={() => {
                    if (!departmentToDelete) return;
                    deleteMutation.mutate(departmentToDelete.id);
                }}
                isPending={deleteMutation.isPending}
            />
        </div>
    );
}
