"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Item } from "@/types";
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity">
            <div className="w-full max-w-lg rounded border bg-white p-6 shadow-lg">
                {error && (
                    <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded p-1 hover:bg-gray-100"
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

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <input
                            {...register("name")}
                            placeholder="Item Name"
                            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.name && (
                            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            {...register("description")}
                            placeholder="Item Description"
                            rows={3}
                            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        {errors.description && (
                            <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && (
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                            )}
                            {initialData ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
