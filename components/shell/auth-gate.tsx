import { UserMenu } from "@/components/shell/user-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublicSession } from "@/lib/session";

export async function AuthGate() {
  const session = await getPublicSession();

  if (!session) {
    return null;
  }

  return <UserMenu user={session.user} />;
}

export function HeaderUserSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden space-y-2 sm:block">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="ml-auto h-2.5 w-14" />
      </div>
      <Skeleton className="size-9 rounded-full" />
    </div>
  );
}
