"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getItems, createItem, updateItem, deleteItem } from "@/lib/api/items";
import { useState, useMemo } from "react";
import { ItemModal } from "@/components/ItemModal";
import { Button } from "@/components/ui/button";
import { ItemSkeleton } from "@/components/ItemSkeleton";
import { Item } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/Pagination";

export default function ItemsPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 12;

    const { data: items, isLoading, isFetched } = useQuery({
        queryKey: ["items"],
        queryFn: getItems,
    });

    const createMutation = useMutation({
        mutationFn: createItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["items"] });
            setIsModalOpen(false);
            toast.success("Item created successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create item");
        }
    });

    const updateMutation = useMutation({
        mutationFn: updateItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["items"] });
            setIsModalOpen(false);
            setSelectedItem(null);
            toast.success("Item updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update item");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["items"] });
            toast.success("Item deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete item");
        }
    });

    const filteredItems = useMemo(() => {
        if (!items) return [];
        const q = searchQuery.toLowerCase();
        return items.filter((i: Item) =>
            i.name.toLowerCase().includes(q) ||
            i.description?.toLowerCase().includes(q)
        );
    }, [items, searchQuery]);

    const paginatedItems = useMemo(() => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return filteredItems.slice(start, end);
    }, [filteredItems, page, pageSize]);

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
        <div className="min-h-[calc(100vh-100px)] p-4 md:p-8 bg-white">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Items</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track your mall items</p>
                </div>
                <Button onClick={handleAdd}>
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Item
                </Button>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by name or description..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                    }}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {isLoading ? (
                <ItemSkeleton />
            ) : (
                <>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {paginatedItems.map((item) => (
                            <Card key={item.id} className="border">
                                <CardContent className="p-4">
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="h-10 w-10 rounded bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm">
                                            {item.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="rounded p-1 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
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
                                                className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
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

                                    <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                        {item.description || "No description"}
                                    </p>
                                    <div className="mt-3 text-xs text-gray-400">
                                        {new Date(item.createdAt).toLocaleDateString()}
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

            <Pagination
                page={page}
                pageSize={pageSize}
                total={filteredItems.length}
                onPageChange={setPage}
            />

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
