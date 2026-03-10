"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Department, Role } from "@/types";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const userSchema = z.object({
    email: z.string().email("Invalid email").min(1, "Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
    role: z.enum(["ADMIN", "USER"]),
    departmentId: z.string().optional().or(z.literal("")),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UserFormData) => void;
    initialData?: User | null;
    departments: Department[];
    title: string;
    isSubmitting?: boolean;
    error?: string | null;
}

export function UserModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    departments,
    title,
    isSubmitting,
    error,
}: UserModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            email: "",
            password: "",
            role: "USER",
            departmentId: "",
        },
    });

    useEffect(() => {
        if (initialData) {
            reset({
                email: initialData.email,
                password: "", // Don't show hashed password
                role: initialData.role,
                departmentId: initialData.departmentId || "",
            });
        } else {
            reset({
                email: "",
                password: "",
                role: "USER",
                departmentId: "",
            });
        }
    }, [initialData, reset, isOpen]);

    const handleFormSubmit = (data: UserFormData) => {
        // For existing users, if password is empty, don't send it
        const sanitizedData = { ...data };
        if (initialData && !sanitizedData.password) {
            delete sanitizedData.password;
        }
        if (!sanitizedData.departmentId) {
            sanitizedData.departmentId = undefined;
        }
        onSubmit(sanitizedData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 font-medium">
                        {error}
                    </div>
                )}
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                    >
                        <svg
                            className="h-5 w-5 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Email Address</label>
                        <input
                            {...register("email")}
                            placeholder="user@example.com"
                            className="w-full rounded-xl border bg-gray-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all border-gray-100"
                        />
                        {errors.email && (
                            <p className="text-xs text-red-500 mt-1 font-medium">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">
                            {initialData ? "New Password (Leave blank to keep current)" : "Password"}
                        </label>
                        <input
                            type="password"
                            {...register("password")}
                            placeholder="••••••••"
                            className="w-full rounded-xl border bg-gray-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all border-gray-100"
                        />
                        {errors.password && (
                            <p className="text-xs text-red-500 mt-1 font-medium">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Role</label>
                            <select
                                {...register("role")}
                                className="w-full rounded-xl border bg-gray-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all border-gray-100 appearance-none"
                            >
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">Department</label>
                            <select
                                {...register("departmentId")}
                                className="w-full rounded-xl border bg-gray-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all border-gray-100 appearance-none"
                            >
                                <option value="">No Department</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="rounded-xl border-gray-200 py-6 px-6 font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-xl py-6 px-8 font-semibold shadow-lg shadow-purple-900/10"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (initialData ? "Update User" : "Create User")}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
