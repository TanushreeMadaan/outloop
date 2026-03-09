"use client";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export function TableSkeleton({ columns, rows = 6 }: TableSkeletonProps) {
  const safeColumns = Math.max(1, columns);
  const safeRows = Math.max(1, rows);

  return (
    <div className="w-full space-y-2 animate-pulse">
      {Array.from({ length: safeRows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex gap-2 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3"
        >
          {Array.from({ length: safeColumns }).map((__, colIdx) => (
            <div
              key={colIdx}
              className="h-3.5 flex-1 rounded-full bg-gray-200/80"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

