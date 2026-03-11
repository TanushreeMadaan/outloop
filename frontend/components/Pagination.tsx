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
    <div className="table-shell mt-4 flex flex-col items-center justify-between gap-2 px-4 py-3 text-xs text-muted-foreground sm:flex-row">
      <div className="order-2 sm:order-1">
        <span className="font-semibold text-foreground">
          Showing {start}-{end}
        </span>
        <span className="ml-1 text-muted-foreground">of {total}</span>
      </div>

      <div className="order-1 flex items-center gap-2 sm:order-2">
        <button
          type="button"
          onClick={() => goTo(currentPage - 1)}
          disabled={!canPrev}
          className="inline-flex items-center gap-1 rounded-full border border-white/75 bg-white/72 px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-3 w-3" />
          <span>Prev</span>
        </button>
        <div className="text-[11px] font-semibold text-muted-foreground tabular-nums">
          Page <span className="text-foreground">{currentPage}</span> of{" "}
          <span className="text-foreground">{totalPages}</span>
        </div>
        <button
          type="button"
          onClick={() => goTo(currentPage + 1)}
          disabled={!canNext}
          className="inline-flex items-center gap-1 rounded-full border border-white/75 bg-white/72 px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span>Next</span>
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
