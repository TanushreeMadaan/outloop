"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, createUser, updateUser, deleteUser } from "@/lib/api/users";
import { getDepartments } from "@/lib/api/departments";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { UserModal } from "@/components/UserModal";
import { TableSkeleton } from "@/components/TableSkeleton";
import { UserPlus, Pencil, Trash2, Building, Calendar, Search } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

export default function UsersPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
        queryKey: ["users"],
        queryFn: getUsers,
    });

    const { data: departments = [] } = useQuery({
        queryKey: ["departments"],
        queryFn: getDepartments,
    });

    const createMutation = useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setIsModalOpen(false);
            toast.success("User created successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create user");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setIsModalOpen(false);
            toast.success("User updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update user");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete user");
        },
    });

    const handleCreateOrUpdate = (data: any) => {
        if (selectedUser) {
            updateMutation.mutate({ id: selectedUser.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            deleteMutation.mutate(id);
        }
    };

    const filteredUsers = users.filter((user) =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="page-shell mx-auto max-w-7xl space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">Manage organization members and their access levels.</p>
                </div>
                <Button
                    onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
                    className="h-11 gap-3 px-6"
                >
                    <UserPlus className="w-5 h-5" />
                    <span className="font-bold">Add New User</span>
                </Button>
            </div>

            <div className="relative group">
                <Search className="control-input-icon transition-colors group-focus-within:text-[rgb(104,114,176)]" />
                <input
                    type="text"
                    placeholder="Search by email or department..."
                    className="control-input control-input-with-icon h-14 font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="table-shell">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="table-head">
                                <th className="p-6">User Details</th>
                                <th className="p-6 text-center">Role</th>
                                <th className="p-6">Department</th>
                                <th className="p-6">Joined Date</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {isLoadingUsers ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className="p-6"><TableSkeleton columns={5} rows={1} /></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center font-medium italic text-muted-foreground">No users found matching your criteria.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="table-row group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="soft-icon-chip h-10 w-10 text-lg font-bold text-[rgb(104,114,176)]">
                                                    {user.email[0].toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-foreground">{user.email}</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Verified Member</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex justify-center">
                                                <span className={`soft-tag ${user.role === 'ADMIN'
                                                    ? 'bg-[rgba(217,223,248,0.86)] text-[rgb(104,114,176)]'
                                                    : 'bg-[rgba(214,230,247,0.86)] text-[rgb(99,132,170)]'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground/78">
                                                <Building className="h-4 w-4 text-muted-foreground/70" />
                                                {user.department?.name || "N/A"}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4 text-muted-foreground/70" />
                                                {format(new Date(user.createdAt), "MMM d, yyyy")}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
                                                    className="rounded-full p-2 text-[rgb(104,114,176)] transition-colors hover:bg-[rgba(217,223,248,0.7)]"
                                                    title="Edit User"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="rounded-full p-2 text-[rgb(170,97,112)] transition-colors hover:bg-[rgba(246,221,223,0.72)]"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateOrUpdate}
                initialData={selectedUser}
                departments={departments}
                title={selectedUser ? "Edit User Profile" : "Onboard New User"}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}
