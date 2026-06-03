import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getPublicSession } from "@/lib/session";

export async function AuthCta() {
  const session = await getPublicSession();

  if (session) {
    return (
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/playlists">
            Open your playlists
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Signed in as {session.user.displayName}
        </p>
      </div>
    );
  }

  return (
    <Button asChild size="lg">
      <a href="/api/auth/login">
        Continue with Spotify
        <ArrowRight className="size-4" />
      </a>
    </Button>
  );
}
