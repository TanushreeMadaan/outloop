"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Transaction } from "@/types";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getVendors } from "@/lib/api/vendors";
import { getDepartments } from "@/lib/api/departments";
import { getItems } from "@/lib/api/items";
import { Vendor, Item, Department } from "@/types";

import { format } from "date-fns";
import { Calendar as CalendarIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const transactionSchema = z.object({
    vendorId: z.string().min(1, "Vendor is required"),
    departmentId: z.string().min(1, "Department is required"),
    itemIds: z.array(z.string()).min(1, "At least one item must be selected"),
    isReturnable: z.boolean(),
    remarks: z.string().optional().or(z.literal("")),
    expectedReturnDate: z.string().optional().nullable(),
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
    const [vendorSearch, setVendorSearch] = useState("");
    const [deptSearch, setDeptSearch] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
    const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);

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
            expectedReturnDate: null,
        },
    });

    const selectedItemIds = watch("itemIds");
    const isReturnable = watch("isReturnable");
    const expectedReturnDate = watch("expectedReturnDate");

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
                expectedReturnDate: initialData.expectedReturnDate || null,
            });
            setVendorSearch(initialData.vendor?.name || "");
            setDeptSearch(initialData.department?.name || "");
        } else {
            reset({
                vendorId: "",
                departmentId: "",
                itemIds: [],
                isReturnable: false,
                remarks: "",
                expectedReturnDate: null,
            });
            setVendorSearch("");
            setDeptSearch("");
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

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(vendorSearch.toLowerCase())
    );

    const filteredDepts = departments.filter(d =>
        d.name.toLowerCase().includes(deptSearch.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded border bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
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
                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Vendor</label>
                            <div className="relative">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search vendor..."
                                        value={vendorSearch}
                                        onChange={(e) => {
                                            setVendorSearch(e.target.value);
                                            setIsVendorDropdownOpen(true);
                                            if (errors.vendorId) setValue("vendorId", "");
                                        }}
                                        onFocus={() => setIsVendorDropdownOpen(true)}
                                        className="w-full rounded-2xl border bg-gray-50/50 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all font-medium"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                {isVendorDropdownOpen && (vendorSearch || filteredVendors.length > 0) && (
                                    <div className="absolute z-10 mt-2 w-full max-h-60 overflow-y-auto rounded-2xl border bg-white p-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                                        {filteredVendors.length > 0 ? (
                                            filteredVendors.map(v => (
                                                <button
                                                    key={v.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setValue("vendorId", v.id);
                                                        setVendorSearch(v.name);
                                                        setIsVendorDropdownOpen(false);
                                                    }}
                                                    className="w-full flex items-center px-4 py-3 rounded-xl text-left text-sm font-medium hover:bg-purple-50 hover:text-purple-700 transition-all"
                                                >
                                                    {v.name}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-4 text-sm text-gray-400 italic text-center">No vendors found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {errors.vendorId && <p className="text-xs text-red-500 ml-1 font-medium">{errors.vendorId.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Department</label>
                            <div className="relative">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search department..."
                                        value={deptSearch}
                                        onChange={(e) => {
                                            setDeptSearch(e.target.value);
                                            setIsDeptDropdownOpen(true);
                                            if (errors.departmentId) setValue("departmentId", "");
                                        }}
                                        onFocus={() => setIsDeptDropdownOpen(true)}
                                        className="w-full rounded-2xl border bg-gray-50/50 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all font-medium"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                {isDeptDropdownOpen && (deptSearch || filteredDepts.length > 0) && (
                                    <div className="absolute z-10 mt-2 w-full max-h-60 overflow-y-auto rounded-2xl border bg-white p-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                                        {filteredDepts.length > 0 ? (
                                            filteredDepts.map(d => (
                                                <button
                                                    key={d.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setValue("departmentId", d.id);
                                                        setDeptSearch(d.name);
                                                        setIsDeptDropdownOpen(false);
                                                    }}
                                                    className="w-full flex items-center px-4 py-3 rounded-xl text-left text-sm font-medium hover:bg-purple-50 hover:text-purple-700 transition-all"
                                                >
                                                    {d.name}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-4 text-sm text-gray-400 italic text-center">No departments found</div>
                                        )}
                                    </div>
                                )}
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
                                <svg className="control-input-icon text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                    className="w-full rounded-2xl border bg-gray-50/50 py-3.5 pr-4 pl-14 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-200"
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

                    <div className="space-y-3 p-1 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className="flex p-1 gap-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setValue("isReturnable", false);
                                    setValue("expectedReturnDate", null);
                                }}
                                className={cn(
                                    "flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-200",
                                    !isReturnable
                                        ? "bg-white text-emerald-600 shadow-sm border border-gray-100"
                                        : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                <span className={cn("text-sm font-bold", !isReturnable ? "text-emerald-700" : "text-gray-500")}>Consumable</span>
                                <span className="text-[10px] font-medium opacity-70">Single use asset</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setValue("isReturnable", true)}
                                className={cn(
                                    "flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-200",
                                    isReturnable
                                        ? "bg-white text-amber-600 shadow-sm border border-gray-100"
                                        : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                <span className={cn("text-sm font-bold", isReturnable ? "text-amber-700" : "text-gray-500")}>Returnable</span>
                                <span className="text-[10px] font-medium opacity-70">Should be returned</span>
                            </button>
                        </div>
                    </div>

                    {isReturnable && (
                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Expected Return Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full rounded-2xl border bg-gray-50/50 px-4 py-6.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all justify-start text-left",
                                            !expectedReturnDate && "text-gray-400"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-purple-600" />
                                        {expectedReturnDate ? (
                                            format(new Date(expectedReturnDate), "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl border-gray-200/50" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={expectedReturnDate ? new Date(expectedReturnDate) : undefined}
                                        onSelect={(date) => {
                                            setValue("expectedReturnDate", date ? date.toISOString() : null);
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.expectedReturnDate && <p className="text-xs text-red-500 ml-1 font-medium">{errors.expectedReturnDate.message}</p>}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Remarks</label>
                        <textarea
                            {...register("remarks")}
                            placeholder="Add any internal notes about this movement..."
                            rows={3}
                            className="w-full rounded-2xl border bg-gray-50/50 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all resize-none font-medium placeholder:text-gray-300"
                        />
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
                            {initialData ? "Update" : "Save"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
