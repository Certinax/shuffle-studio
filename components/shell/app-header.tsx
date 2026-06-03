import Link from "next/link";
import { Suspense } from "react";
import { Shuffle } from "lucide-react";

import { AuthGate, HeaderUserSkeleton } from "@/components/shell/auth-gate";
import { GlobalShuffleStats } from "@/components/shell/shuffle-stats";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-primary shadow-[0_0_45px_rgba(29,185,84,0.18)]">
            <Shuffle className="size-4 transition-transform group-hover:rotate-12" />
          </span>
          <span className="font-semibold tracking-[-0.03em]">Shuffle Studio</span>
        </Link>

        <GlobalShuffleStats />

        <Suspense fallback={<HeaderUserSkeleton />}>
          <AuthGate />
        </Suspense>
      </div>
    </header>
  );
}
