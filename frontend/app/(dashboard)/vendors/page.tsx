"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVendors, createVendor, updateVendor, deleteVendor } from "@/lib/api/vendors";
import { useState, useMemo } from "react";
import { VendorModal } from "@/components/VendorModal";
import { Button } from "@/components/ui/button";
import { BackgroundGradients } from "@/components/BackgroundGradients";
import { ItemSkeleton } from "@/components/ItemSkeleton";
import { Vendor } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/Pagination";

export default function VendorsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { data: vendors, isLoading, isFetched } = useQuery({
    queryKey: ["vendors"],
    queryFn: getVendors,
  });

  const createMutation = useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setIsModalOpen(false);
      setSelectedVendor(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });

  const filteredVendors = useMemo(() => {
    if (!vendors) return [];
    const q = searchQuery.toLowerCase();
    return vendors.filter((v: Vendor) =>
      v.name.toLowerCase().includes(q) ||
      v.email?.toLowerCase().includes(q) ||
      v.gstNumber?.toLowerCase().includes(q)
    );
  }, [vendors, searchQuery]);

  const paginatedVendors = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredVendors.slice(start, end);
  }, [filteredVendors, page, pageSize]);

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedVendor(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleModalSubmit = (data: any) => {
    if (selectedVendor) {
      updateMutation.mutate({ id: selectedVendor.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-100px)] space-y-8 p-4 md:p-8 overflow-hidden">
      <BackgroundGradients />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 leading-tight">Vendors</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your suppliers and service providers</p>
        </div>
        <Button
          onClick={handleAdd}
          className="w-full sm:w-auto rounded-xl bg-purple-800 px-6 py-6 text-white hover:bg-purple-900 transition shadow-lg shadow-purple-900/10"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Vendor
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
            placeholder="Search by name, email or GST..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-2xl border bg-white/60 backdrop-blur-sm px-11 py-3.5 text-sm ring-offset-background transition-all focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>
      </div>

      {isLoading ? (
        <ItemSkeleton />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedVendors.map((vendor) => (
              <Card
                key={vendor.id}
                className="group relative overflow-hidden rounded-2xl border bg-white/80 backdrop-blur-md transition-all hover:shadow-xl hover:shadow-purple-900/5 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center text-purple-700 font-bold text-xl ring-1 ring-purple-100/50">
                      {vendor.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(vendor)}
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
                        onClick={() => handleDelete(vendor.id)}
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
                    <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                    <div className="mt-3 space-y-2">
                      {vendor.email && (
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="mr-2 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{vendor.email}</span>
                        </div>
                      )}
                      {vendor.phoneNo && (
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="mr-2 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{vendor.phoneNo}</span>
                        </div>
                      )}
                      {vendor.gstNumber && (
                        <div className="flex items-center text-sm">
                          <span className="mr-2 rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 ring-1 ring-purple-100">GST</span>
                          <span className="text-gray-600 font-mono tracking-tighter">{vendor.gstNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {isFetched && filteredVendors.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-white/40 rounded-3xl border border-dashed">
              <div className="h-16 w-16 mb-4 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No vendors found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search or add a new vendor</p>
            </div>
          )}
        </>
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        total={filteredVendors.length}
        onPageChange={setPage}
      />

      <VendorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedVendor}
        title={selectedVendor ? "Edit Vendor" : "Add New Vendor"}
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