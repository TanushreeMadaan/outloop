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
        <div className="page-shell">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Items</h1>
                    <p className="page-subtitle">Manage and track your mall items</p>
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
                    className="control-input"
                />
            </div>

            {isLoading ? (
                <ItemSkeleton />
            ) : (
                <>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {paginatedItems.map((item) => (
                            <Card key={item.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="soft-icon-chip h-10 w-10 bg-secondary text-sm font-semibold text-foreground">
                                            {item.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="rounded-full p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
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
                                                className="rounded-full p-1.5 text-muted-foreground transition hover:bg-primary/12 hover:text-primary"
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

                                    <h3 className="text-sm font-medium text-foreground">{item.name}</h3>
                                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                        {item.description || "No description"}
                                    </p>
                                    <div className="mt-3 text-xs text-muted-foreground">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {isFetched && filteredItems.length === 0 && (
                        <div className="empty-state">
                            <div className="soft-icon-chip mb-4 h-16 w-16 text-muted-foreground">
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-foreground">No items found</h3>
                            <p className="mt-1 text-muted-foreground">Try adjusting your search or add a new item</p>
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
