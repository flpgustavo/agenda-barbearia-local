"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DisponibilidadeSkeleton() {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-max">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col w-[130px] shrink-0 border rounded-lg p-3 bg-card">
            <Skeleton className="h-4 w-16 mx-auto mb-1" />
            <Skeleton className="h-5 w-14 mx-auto mb-3" />
            <Skeleton className="h-4 w-full mb-1" />
            <div className="border-t pt-2 mt-1">
              <Skeleton className="h-6 w-14 mb-1" />
              <Skeleton className="h-6 w-14 mb-1" />
              <Skeleton className="h-6 w-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
