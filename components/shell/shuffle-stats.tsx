"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

import {
  notifyShuffleStatsUpdated,
  SHUFFLE_STATS_UPDATED_EVENT,
  type ShuffleStatsPayload,
} from "@/lib/stats/client";
import type { ShuffleStatsResponse } from "@/lib/stats/types";

function formatCount(value: number) {
  return value.toLocaleString();
}

function shuffleLabel(count: number) {
  return count === 1 ? "shuffle" : "shuffles";
}

async function fetchStats(): Promise<ShuffleStatsResponse> {
  const response = await fetch("/api/stats", { cache: "no-store" });

  if (!response.ok) {
    return { enabled: false };
  }

  return response.json();
}

export function GlobalShuffleStats() {
  const [global, setGlobal] = useState<number | null>(null);

  const applyStats = useCallback((stats: ShuffleStatsPayload | ShuffleStatsResponse) => {
    if (!stats.enabled || stats.global === undefined) {
      setGlobal(null);
      return;
    }

    setGlobal(stats.global);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const stats = await fetchStats();

      if (!cancelled) {
        applyStats(stats);
      }
    };

    void load();
    const interval = window.setInterval(() => {
      void load();
    }, 30_000);

    const onUpdated = (event: Event) => {
      applyStats((event as CustomEvent<ShuffleStatsPayload>).detail);
    };

    window.addEventListener(SHUFFLE_STATS_UPDATED_EVENT, onUpdated);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener(SHUFFLE_STATS_UPDATED_EVENT, onUpdated);
    };
  }, [applyStats]);

  if (global === null) {
    return null;
  }

  return (
    <div
      className="hidden items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm text-primary md:inline-flex"
      aria-live="polite"
    >
      <Sparkles className="size-3.5 shrink-0" aria-hidden />
      <span className="font-medium tabular-nums">{formatCount(global)}</span>
      <span className="text-primary/80">{shuffleLabel(global)} studio-wide</span>
    </div>
  );
}

export function UserShuffleStat({
  initialCount,
}: {
  initialCount: number | null;
}) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<ShuffleStatsPayload>).detail;

      if (!detail.enabled || detail.user === undefined || detail.user === null) {
        return;
      }

      setCount(detail.user);
    };

    window.addEventListener(SHUFFLE_STATS_UPDATED_EVENT, onUpdated);

    return () => {
      window.removeEventListener(SHUFFLE_STATS_UPDATED_EVENT, onUpdated);
    };
  }, []);

  if (count === null) {
    return <p className="mt-1 text-xs text-muted-foreground">Connected</p>;
  }

  return (
    <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">
      {formatCount(count)} {shuffleLabel(count)} by you
    </p>
  );
}

export function HomeShuffleStats() {
  const [stats, setStats] = useState<{
    global: number;
    user: number | null;
  } | null>(null);

  const applyStats = useCallback((payload: ShuffleStatsPayload | ShuffleStatsResponse) => {
    if (!payload.enabled || payload.global === undefined) {
      setStats(null);
      return;
    }

    setStats({
      global: payload.global,
      user: payload.user ?? null,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const next = await fetchStats();

      if (!cancelled) {
        applyStats(next);
      }
    };

    void load();
    const interval = window.setInterval(() => {
      void load();
    }, 30_000);

    const onUpdated = (event: Event) => {
      applyStats((event as CustomEvent<ShuffleStatsPayload>).detail);
    };

    window.addEventListener(SHUFFLE_STATS_UPDATED_EVENT, onUpdated);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener(SHUFFLE_STATS_UPDATED_EVENT, onUpdated);
    };
  }, [applyStats]);

  if (!stats) {
    return null;
  }

  return (
    <div
      className="mt-8 flex flex-wrap items-center justify-center gap-3"
      aria-live="polite"
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm">
        <Sparkles className="size-4 text-primary" aria-hidden />
        <span>
          <span className="font-semibold tabular-nums text-foreground">
            {formatCount(stats.global)}
          </span>{" "}
          <span className="text-muted-foreground">
            {shuffleLabel(stats.global)} created studio-wide
          </span>
        </span>
      </div>
      {stats.user !== null ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
          <span>
            You&apos;ve shuffled{" "}
            <span className="font-semibold tabular-nums">{formatCount(stats.user)}</span>{" "}
            {stats.user === 1 ? "playlist" : "playlists"}
          </span>
        </div>
      ) : null}
    </div>
  );
}
