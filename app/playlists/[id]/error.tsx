"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCcw } from "lucide-react";

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
          Couldn’t load this playlist
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The playlist may no longer be available to this Spotify account, or the Spotify
          API request failed.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>
            <RefreshCcw className="size-4" />
            Try again
          </Button>
          <Button asChild variant="secondary">
            <Link href="/playlists">
              <ArrowLeft className="size-4" />
              Back to playlists
            </Link>
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
}
