"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Item } from "@/app/(dashboard)/items/page";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const itemSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional().or(z.literal("")),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface ItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ItemFormData) => void;
    initialData?: Item | null;
    title: string;
    isSubmitting?: boolean;
    error?: string | null;
}

export function ItemModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    title,
    isSubmitting,
    error,
}: ItemModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ItemFormData>({
        resolver: zodResolver(itemSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                description: initialData.description || "",
            });
        } else {
            reset({
                name: "",
                description: "",
            });
        }
    }, [initialData, reset, isOpen]);

    const handleFormSubmit = (data: ItemFormData) => {
        // Sanitize empty strings
        const sanitizedData = Object.entries(data).reduce((acc, [key, value]) => {
            acc[key as keyof ItemFormData] = value === "" ? undefined : value;
            return acc;
        }, {} as any);
        onSubmit(sanitizedData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="w-full max-w-lg scale-100 rounded-2xl border bg-white p-8 shadow-2xl transition-all">
                {error && (
                    <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                        {error}
                    </div>
                )}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 hover:bg-gray-100 transition"
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

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <input
                            {...register("name")}
                            placeholder="Item Name"
                            className="w-full rounded-xl border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition"
                        />
                        {errors.name && (
                            <p className="text-xs text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            {...register("description")}
                            placeholder="Item Description"
                            rows={3}
                            className="w-full rounded-xl border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition resize-none"
                        />
                        {errors.description && (
                            <p className="text-xs text-red-500">{errors.description.message}</p>
                        )}
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="rounded-xl px-6 py-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-xl bg-purple-800 px-6 py-2 text-white hover:bg-purple-900 transition flex items-center gap-2"
                        >
                            {isSubmitting && (
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            )}
                            {initialData ? "Update Item" : "Create Item"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
