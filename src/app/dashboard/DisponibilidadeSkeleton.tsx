"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DisponibilidadeSkeleton() {
  return (
    <div className="pb-4">
      <div className="flex flex-col gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 w-full border rounded-lg px-4 py-3 bg-card">
            <div className="min-w-[90px]">
              <Skeleton className="h-4 w-12 mb-1" />
              <Skeleton className="h-5 w-14" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-1.5 w-full" />
            </div>
            <div className="min-w-[100px] text-right">
              <Skeleton className="h-6 w-10 ml-auto mb-1" />
              <Skeleton className="h-3 w-16 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
