"use client";

import { useActionState, useEffect, useState } from "react";
import { ArrowUpRight, Loader2, Shuffle } from "lucide-react";
import { toast } from "sonner";

import { shufflePlaylist, type ShuffleActionState } from "@/lib/actions/shuffle";
import type { PlaylistDetails, PlaylistVisibility } from "@/lib/spotify/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const initialState: ShuffleActionState = { status: "idle" };

function visibilityCopy(value: PlaylistVisibility, playlist: PlaylistDetails) {
  if (value === "public") {
    return "The new playlist will appear on your public Spotify profile.";
  }

  if (value === "private") {
    return "The new playlist will only be visible to you.";
  }

  return playlist.isPublic
    ? "The new playlist will be public like the original."
    : "The new playlist will stay private like the original.";
}

function PendingContent({ trackCount }: { trackCount: number }) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
      <div className="flex items-center gap-3">
        <Loader2 className="size-4 animate-spin text-primary" />
        <div>
          <p className="text-sm font-medium">Creating shuffled playlist</p>
          <p className="text-xs text-muted-foreground">
            Fetching, shuffling, and adding {trackCount.toLocaleString()} tracks in safe batches.
          </p>
        </div>
      </div>
      <Progress className="mt-4" />
    </div>
  );
}

export function ShufflePanel({
  playlist,
  trackCount,
}: {
  playlist: PlaylistDetails;
  trackCount: number;
}) {
  const [visibility, setVisibility] = useState<PlaylistVisibility>("same");
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(shufflePlaylist, initialState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success("Playlist created", {
        description: state.message,
        action: state.playlistUrl
          ? {
              label: "Open",
              onClick: () => window.open(state.playlistUrl, "_blank", "noopener,noreferrer"),
            }
          : undefined,
      });
    }

    if (state.status === "error" && state.message) {
      toast.error("Shuffle failed", {
        description: state.message,
      });
    }
  }, [state]);

  return (
    <div className="glass-card sticky top-24 rounded-3xl border border-white/10 p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Shuffle className="size-5" />
        </div>
        <div>
          <h2 className="font-semibold tracking-[-0.02em]">Shuffle this playlist</h2>
          <p className="text-sm text-muted-foreground">
            Create a new playlist without changing the original.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-sm font-medium">Visibility</p>
        <RadioGroup
          value={visibility}
          onValueChange={(value) => setVisibility(value as PlaylistVisibility)}
        >
          {[
            ["same", "Same as original"],
            ["public", "Public"],
            ["private", "Private"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm transition-colors hover:bg-white/[0.07]"
            >
              <RadioGroupItem value={value} />
              <span>{label}</span>
            </label>
          ))}
        </RadioGroup>
        <p className="min-h-10 text-sm leading-5 text-muted-foreground">
          {visibilityCopy(visibility, playlist)}
        </p>
      </div>

      {state.status === "success" && state.playlistUrl ? (
        <Button asChild variant="secondary" className="mt-2 w-full">
          <a href={state.playlistUrl} target="_blank" rel="noreferrer">
            Open {state.playlistName}
            <ArrowUpRight className="size-4" />
          </a>
        </Button>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mt-4 w-full" size="lg" disabled={trackCount === 0}>
            Shuffle & create
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a shuffled copy?</DialogTitle>
            <DialogDescription>
              We’ll create a new playlist named like{" "}
              <span className="text-foreground">shuffled-1-{playlist.name}</span> and
              add the same tracks in a fresh random order.
            </DialogDescription>
          </DialogHeader>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="playlistId" value={playlist.id} />
            <input type="hidden" name="visibility" value={visibility} />
            <div className="min-h-28">
              {pending ? (
                <PendingContent trackCount={trackCount} />
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-muted-foreground">
                  Ready to shuffle {trackCount.toLocaleString()} playable tracks.
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending || trackCount === 0}>
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating
                  </>
                ) : (
                  "Confirm shuffle"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
