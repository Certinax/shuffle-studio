import { LogOut } from "lucide-react";

import { UserShuffleStat } from "@/components/shell/shuffle-stats";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { SessionUser } from "@/lib/session";

export function UserMenu({
  user,
  shuffleCount,
}: {
  user: SessionUser;
  shuffleCount: number | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-none">{user.displayName}</p>
        <UserShuffleStat initialCount={shuffleCount} />
      </div>
      <Avatar>
        {user.imageUrl ? <AvatarImage src={user.imageUrl} alt="" /> : null}
        <AvatarFallback>{user.displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
      </Avatar>
      <form action="/api/auth/logout" method="post">
        <Button variant="ghost" size="icon" type="submit" aria-label="Log out">
          <LogOut className="size-4" />
        </Button>
      </form>
    </div>
  );
}
