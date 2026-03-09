"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  if (total <= pageSize || total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const goTo = (next: number) => {
    if (next < 1 || next > totalPages) return;
    onPageChange(next);
  };

  return (
    <div className="mt-4 flex flex-col gap-2 items-center justify-between border border-gray-100 bg-white/70 backdrop-blur-sm rounded-2xl px-4 py-3 text-xs text-gray-600 sm:flex-row">
      <div className="order-2 sm:order-1">
        <span className="font-semibold text-gray-800">
          Showing {start}-{end}
        </span>
        <span className="ml-1 text-gray-400">of {total}</span>
      </div>

      <div className="order-1 flex items-center gap-2 sm:order-2">
        <button
          type="button"
          onClick={() => goTo(currentPage - 1)}
          disabled={!canPrev}
          className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="h-3 w-3" />
          <span>Prev</span>
        </button>
        <div className="text-[11px] font-semibold text-gray-500 tabular-nums">
          Page <span className="text-gray-900">{currentPage}</span> of{" "}
          <span className="text-gray-900">{totalPages}</span>
        </div>
        <button
          type="button"
          onClick={() => goTo(currentPage + 1)}
          disabled={!canNext}
          className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

