"use client";

import { Card, CardContent } from "@/components/ui/card";

export function ItemSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden rounded-2xl border bg-white/40 animate-pulse">
                    <CardContent className="p-6">
                        <div className="mb-4 flex items-start justify-between">
                            <div className="h-12 w-12 rounded-xl bg-gray-200" />
                            <div className="flex gap-1">
                                <div className="h-8 w-8 rounded-lg bg-gray-100" />
                                <div className="h-8 w-8 rounded-lg bg-gray-100" />
                            </div>
                        </div>
                        <div className="h-5 w-2/3 rounded bg-gray-200" />
                        <div className="mt-3 space-y-2">
                            <div className="h-4 w-full rounded bg-gray-100" />
                            <div className="h-4 w-5/6 rounded bg-gray-100" />
                        </div>
                        <div className="mt-4 h-3 w-1/3 rounded bg-gray-100" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
