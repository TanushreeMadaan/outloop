"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getItems, createItem, updateItem, deleteItem } from "@/lib/api/items";
import { useState, useMemo } from "react";
import { ItemModal } from "@/components/ItemModal";
import { Button } from "@/components/ui/button";
import { BackgroundGradients } from "@/components/BackgroundGradients";
import { ItemSkeleton } from "@/components/ItemSkeleton";
import { Card, CardContent } from "@/components/ui/card";

export interface Item {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
}

export default function ItemsPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    const { data: items, isLoading, isFetched } = useQuery({
        queryKey: ["items"],
        queryFn: getItems,
    });

    const createMutation = useMutation({
        mutationFn: createItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["items"] });
            setIsModalOpen(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["items"] });
            setIsModalOpen(false);
            setSelectedItem(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["items"] });
        },
    });

    const filteredItems = useMemo(() => {
        if (!items) return [];
        return items.filter((i: Item) =>
            i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [items, searchQuery]);

    const handleEdit = (item: Item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this item?")) {
            deleteMutation.mutate(id);
        }
    };

    const handleModalSubmit = (data: any) => {
        if (selectedItem) {
            updateMutation.mutate({ id: selectedItem.id, ...data });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-100px)] space-y-8 p-4 md:p-8 overflow-hidden">
            <BackgroundGradients />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 leading-tight">Items</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage and track your mall items</p>
                </div>
                <Button
                    onClick={handleAdd}
                    className="w-full sm:w-auto rounded-xl bg-purple-800 px-6 py-6 text-white hover:bg-purple-900 transition shadow-lg shadow-purple-900/10"
                >
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Item
                </Button>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <svg
                        className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-2xl border bg-white/60 backdrop-blur-sm px-11 py-3.5 text-sm ring-offset-background transition-all focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                </div>
            </div>

            {isLoading ? (
                <ItemSkeleton />
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredItems.map((item) => (
                            <Card
                                key={item.id}
                                className="group relative overflow-hidden rounded-2xl border bg-white/80 backdrop-blur-md transition-all hover:shadow-xl hover:shadow-purple-900/5 hover:-translate-y-1"
                            >
                                <CardContent className="p-6">
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-blue-700 font-bold text-xl ring-1 ring-blue-100/50">
                                            {item.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="rounded-lg p-2 text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                        <p className="mt-2 text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
                                            {item.description || "No description available"}
                                        </p>
                                        <div className="mt-4 flex items-center text-[11px] text-gray-400 uppercase tracking-widest font-medium">
                                            <svg className="mr-1.5 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Added {new Date(item.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {isFetched && filteredItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-white/40 rounded-3xl border border-dashed">
                            <div className="h-16 w-16 mb-4 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No items found</h3>
                            <p className="text-gray-500 mt-1">Try adjusting your search or add a new item</p>
                        </div>
                    )}
                </>
            )}

            <ItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={selectedItem}
                title={selectedItem ? "Edit Item" : "Add New Item"}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
                error={
                    (createMutation.error as any)?.response?.data?.message ||
                    (updateMutation.error as any)?.response?.data?.message ||
                    null
                }
            />
        </div>
    );
}
