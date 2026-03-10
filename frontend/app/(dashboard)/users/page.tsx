"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, createUser, updateUser, deleteUser } from "@/lib/api/users";
import { getDepartments } from "@/lib/api/departments";
import { User, Role } from "@/types";
import { Button } from "@/components/ui/button";
import { UserModal } from "@/components/UserModal";
import { TableSkeleton } from "@/components/TableSkeleton";
import { UserPlus, Pencil, Trash2, Mail, Shield, Building, Calendar, MoreVertical, Search } from "lucide-react";
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
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">User Management</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage organization members and their access levels.</p>
                </div>
                <Button
                    onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
                    className="rounded-2xl h-14 px-8 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 flex gap-3"
                >
                    <UserPlus className="w-5 h-5" />
                    <span className="font-bold">Add New User</span>
                </Button>
            </div>

            {/* Filter & Search Bar */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search by email or department..."
                    className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-100 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden shadow-gray-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-6 text-[11px] font-bold uppercase tracking-wider text-gray-400">User Details</th>
                                <th className="p-6 text-[11px] font-bold uppercase tracking-wider text-gray-400 text-center">Role</th>
                                <th className="p-6 text-[11px] font-bold uppercase tracking-wider text-gray-400">Department</th>
                                <th className="p-6 text-[11px] font-bold uppercase tracking-wider text-gray-400">Joined Date</th>
                                <th className="p-6 text-[11px] font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoadingUsers ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className="p-6"><TableSkeleton columns={5} rows={1} /></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-400 font-medium italic">No users found matching your criteria.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                    {user.email[0].toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900">{user.email}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Verified Member</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex justify-center">
                                                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${user.role === 'ADMIN'
                                                    ? 'bg-purple-50 text-purple-600 border-purple-100'
                                                    : 'bg-blue-50 text-blue-600 border-blue-100'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
                                                <Building className="w-4 h-4 text-gray-300" />
                                                {user.department?.name || "N/A"}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="w-4 h-4 text-gray-300" />
                                                {format(new Date(user.createdAt), "MMM d, yyyy")}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
                                                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
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
