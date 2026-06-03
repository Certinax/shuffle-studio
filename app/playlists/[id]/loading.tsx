import { ArrowLeft } from "lucide-react";

import { PageContainer } from "@/components/shell/page-container";
import { TrackListSkeleton } from "@/components/tracks/track-list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <PageContainer>
      <div className="mb-6 flex h-11 items-center">
        <ArrowLeft className="mr-2 size-4 text-muted-foreground" />
        <Skeleton className="h-4 w-28" />
      </div>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-6">
          <div className="glass-card rounded-3xl border border-white/10 p-5">
            <div className="flex flex-col gap-5 sm:flex-row">
              <Skeleton className="size-36 rounded-2xl" />
              <div className="flex flex-1 flex-col justify-end">
                <div className="mb-3 flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="mt-3 h-4 w-32" />
                <Skeleton className="mt-5 h-9 w-36 rounded-full" />
              </div>
            </div>
          </div>

          <TrackListSkeleton />
        </div>

        <div className="glass-card rounded-3xl border border-white/10 p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-12 rounded-2xl" />
            <Skeleton className="h-12 rounded-2xl" />
            <Skeleton className="h-12 rounded-2xl" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
