"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getVendors, createVendor, updateVendor, deleteVendor } from "@/lib/api/vendors";
import { useState, useMemo } from "react";
import { VendorModal } from "@/components/VendorModal";
import { Button } from "@/components/ui/button";

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
      toast.success("Vendor created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create vendor");
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setIsModalOpen(false);
      setSelectedVendor(null);
      toast.success("Vendor updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update vendor");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete vendor");
    }
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

  const hasContactInfo = (vendor: Vendor) =>
    Boolean(vendor.email || vendor.phoneNo || vendor.gstNumber);

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
    <div className="page-shell">

      <div className="page-header">
        <div>
          <h1 className="page-title">Vendors</h1>
          <p className="page-subtitle">Manage your suppliers and service providers</p>
        </div>
        <Button onClick={handleAdd}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Vendor
        </Button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email or GST..."
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedVendors.map((vendor) => (
              <Card
                key={vendor.id}
                className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="soft-icon-chip h-12 w-12 bg-secondary text-xl font-bold text-foreground">
                      {vendor.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(vendor)}
                        className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
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
                        className="rounded-full p-2 text-muted-foreground transition hover:bg-primary/12 hover:text-primary"
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
                    <h3 className="font-semibold text-foreground">{vendor.name}</h3>
                    <div className="mt-3 space-y-2">
                      {vendor.email && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <svg className="mr-2 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{vendor.email}</span>
                        </div>
                      )}
                      {vendor.phoneNo && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <svg className="mr-2 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{vendor.phoneNo}</span>
                        </div>
                      )}
                      {vendor.gstNumber && (
                        <div className="flex items-center text-sm">
                          <span className="mr-2 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold text-foreground">GST</span>
                          <span className="font-mono tracking-tighter text-foreground/78">{vendor.gstNumber}</span>
                        </div>
                      )}
                      {!hasContactInfo(vendor) && (
                        <div className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                          No contact info
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {isFetched && filteredVendors.length === 0 && (
            <div className="empty-state">
              <div className="soft-icon-chip mb-4 h-16 w-16 text-muted-foreground">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground">No vendors found</h3>
              <p className="mt-1 text-muted-foreground">Try adjusting your search or add a new vendor</p>
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
