import { PlaylistGridSkeleton } from "@/components/playlists/playlist-grid-skeleton";
import { PageContainer } from "@/components/shell/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <PageContainer>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-80 max-w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-72 max-w-full" />
          <Skeleton className="h-3 w-60 max-w-full" />
        </div>
      </div>
      <div className="mb-5 flex justify-between">
        <Skeleton className="h-11 w-full max-w-sm rounded-full" />
        <Skeleton className="hidden h-5 w-32 sm:block" />
      </div>
      <PlaylistGridSkeleton />
    </PageContainer>
  );
}
