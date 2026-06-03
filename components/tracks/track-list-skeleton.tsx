import { Skeleton } from "@/components/ui/skeleton";

export function TrackListSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045]">
      <div className="grid grid-cols-[1fr_auto] border-b border-white/10 px-4 py-3 sm:grid-cols-[1fr_9rem_auto]">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="hidden h-3 w-16 sm:block" />
        <Skeleton className="h-3 w-10" />
      </div>
      <div className="space-y-0">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-white/[0.06] px-4 py-3 sm:grid-cols-[1fr_9rem_auto]"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-lg" />
              <div className="w-full space-y-2">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="hidden h-3 w-28 sm:block" />
            <Skeleton className="h-3 w-9" />
          </div>
        ))}
      </div>
    </div>
  );
}
