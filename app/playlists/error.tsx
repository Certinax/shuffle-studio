"use client";

import { RefreshCcw } from "lucide-react";

import { PageContainer } from "@/components/shell/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer className="items-center justify-center">
      <Card className="glass-card max-w-lg p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.04em]">
          Couldn’t load playlists
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Spotify might be rate limiting the request, your session may need refreshing, or
          the app environment is missing credentials.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset}>
            <RefreshCcw className="size-4" />
            Try again
          </Button>
          <Button asChild variant="secondary">
            <a href="/api/auth/login">Reconnect Spotify</a>
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
}
