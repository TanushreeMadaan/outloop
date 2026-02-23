"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Transaction } from "@/lib/api/transactions";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getVendors } from "@/lib/api/vendors";
import { getDepartments } from "@/lib/api/departments";
import { getItems } from "@/lib/api/items";
import { Vendor, Item, Department } from "@/types";

const transactionSchema = z.object({
    vendorId: z.string().min(1, "Vendor is required"),
    departmentId: z.string().min(1, "Department is required"),
    itemIds: z.array(z.string()).min(1, "At least one item must be selected"),
    isReturnable: z.boolean().default(false),
    remarks: z.string().optional().or(z.literal("")),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TransactionFormData) => void;
    initialData?: Transaction | null;
    title: string;
    isSubmitting?: boolean;
    error?: string | null;
}

export function TransactionModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    title,
    isSubmitting,
    error,
}: TransactionModalProps) {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [itemSearch, setItemSearch] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            vendorId: "",
            departmentId: "",
            itemIds: [],
            isReturnable: false,
            remarks: "",
        },
    });

    const selectedItemIds = watch("itemIds");
    const isReturnable = watch("isReturnable");

    useEffect(() => {
        if (isOpen) {
            Promise.all([getVendors(), getDepartments(), getItems()]).then(
                ([v, d, i]) => {
                    setVendors(v as Vendor[]);
                    setDepartments(d as Department[]);
                    setItems(i as Item[]);
                }
            );
        }
    }, [isOpen]);

    useEffect(() => {
        if (initialData) {
            reset({
                vendorId: initialData.vendorId,
                departmentId: initialData.departmentId,
                itemIds: initialData.items.map((it) => it.itemId),
                isReturnable: initialData.isReturnable,
                remarks: initialData.remarks || "",
            });
        } else {
            reset({
                vendorId: "",
                departmentId: "",
                itemIds: [],
                isReturnable: false,
                remarks: "",
            });
        }
    }, [initialData, reset, isOpen]);

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(itemSearch.toLowerCase()) &&
        !selectedItemIds.includes(item.id)
    );

    const handleItemSelect = (itemId: string) => {
        setValue("itemIds", [...selectedItemIds, itemId]);
        setItemSearch("");
        setIsDropdownOpen(false);
    };

    const handleItemRemove = (itemId: string) => {
        setValue("itemIds", selectedItemIds.filter(id => id !== itemId));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity p-4">
            <div className="w-full max-w-2xl scale-100 rounded-3xl border bg-white p-8 shadow-2xl transition-all max-h-[90vh] overflow-y-auto">
                {error && (
                    <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                        {error}
                    </div>
                )}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Vendor</label>
                            <div className="relative">
                                <select
                                    {...register("vendorId")}
                                    className="w-full rounded-2xl border bg-gray-50/50 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all appearance-none"
                                >
                                    <option value="">Select Vendor</option>
                                    {vendors.map((v) => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            {errors.vendorId && <p className="text-xs text-red-500 ml-1 font-medium">{errors.vendorId.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Department</label>
                            <div className="relative">
                                <select
                                    {...register("departmentId")}
                                    className="w-full rounded-2xl border bg-gray-50/50 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all appearance-none"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            {errors.departmentId && <p className="text-xs text-red-500 ml-1 font-medium">{errors.departmentId.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Items selection</label>

                        {/* Selected Items Tags */}
                        {selectedItemIds.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedItemIds.map(id => {
                                    const item = items.find(i => i.id === id);
                                    if (!item) return null;
                                    return (
                                        <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100 transition-all hover:bg-purple-100 group">
                                            {item.name}
                                            <button
                                                type="button"
                                                onClick={() => handleItemRemove(id)}
                                                className="text-purple-300 hover:text-purple-600 transition-colors"
                                            >
                                                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        )}

                        <div className="relative">
                            <div className="relative">
                                <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search items to add..."
                                    value={itemSearch}
                                    onChange={(e) => {
                                        setItemSearch(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    className="w-full rounded-2xl border bg-gray-50/50 px-11 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all font-medium"
                                />
                            </div>

                            {isDropdownOpen && (itemSearch || filteredItems.length > 0) && (
                                <div className="absolute z-10 mt-2 w-full max-h-60 overflow-y-auto rounded-2xl border bg-white p-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                                    {filteredItems.length > 0 ? (
                                        filteredItems.map(item => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => handleItemSelect(item.id)}
                                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm font-medium hover:bg-purple-50 hover:text-purple-700 transition-all group"
                                            >
                                                <span>{item.name}</span>
                                                <svg className="h-4 w-4 text-purple-200 group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-8 text-center text-sm text-gray-400 italic">
                                            No more items found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {errors.itemIds && <p className="text-xs text-red-500 ml-1 font-medium">{errors.itemIds.message}</p>}
                    </div>

                    <div className="flex items-center justify-between py-4 px-6 rounded-2xl bg-purple-50/50 border border-purple-100/50 transition-all hover:border-purple-200/50 group">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold text-gray-900 group-hover:text-purple-900 transition-colors">Returnable Status</span>
                            <span className="text-[11px] text-gray-500 font-medium">Is this a returnable transaction?</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setValue("isReturnable", !isReturnable)}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 ${isReturnable ? "bg-purple-600 shadow-lg shadow-purple-600/20" : "bg-gray-200"
                                }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-sm ${isReturnable ? "translate-x-6" : "translate-x-1"
                                    }`}
                            />
                        </button>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Remarks</label>
                        <textarea
                            {...register("remarks")}
                            placeholder="Add any internal notes about this movement..."
                            rows={3}
                            className="w-full rounded-2xl border bg-gray-50/50 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all resize-none font-medium placeholder:text-gray-300"
                        />
                    </div>

                    <div className="mt-8 flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="rounded-2xl px-10 py-6 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-2xl bg-purple-800 px-10 py-6 text-white hover:bg-purple-900 transition-all flex items-center gap-2 shadow-xl shadow-purple-900/10 active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting && (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            )}
                            <span className="font-semibold">{initialData ? "Update Record" : "Record Movement"}</span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
