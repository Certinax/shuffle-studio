import { Suspense } from "react";
import { ListMusic, LockKeyhole, Sparkles } from "lucide-react";

import { AuthCta } from "@/components/home/auth-cta";
import { PageContainer } from "@/components/shell/page-container";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  return (
    <PageContainer className="justify-center py-16">
      <section className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary">
          <Sparkles className="size-4" />
          Spotify playlists, shuffled properly
        </div>
        <h1 className="text-balance text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">
          Turn any playlist into a fresh shuffled copy.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Connect Spotify, choose a playlist, pick visibility, and create a new
          catalog playlist named <span className="text-foreground">shuffled-n-name</span>.
          The original stays untouched.
        </p>
        <div className="mt-9 min-h-12">
          <Suspense fallback={<Skeleton className="h-12 w-52 rounded-full" />}>
            <AuthCta />
          </Suspense>
        </div>
      </section>

      <section className="mt-16 grid gap-4 md:grid-cols-3">
        {[
          {
            icon: ListMusic,
            title: "Load every playlist",
            body: "Private, collaborative, and owned playlists appear in a fast searchable grid.",
          },
          {
            icon: Sparkles,
            title: "Real shuffle",
            body: "A Fisher-Yates shuffle creates a new order before adding tracks in Spotify-safe batches.",
          },
          {
            icon: LockKeyhole,
            title: "Private by design",
            body: "Tokens are encrypted in httpOnly cookies and never exposed to browser JavaScript.",
          },
        ].map((feature) => (
          <Card key={feature.title} className="glass-card p-5">
            <feature.icon className="size-5 text-primary" />
            <h2 className="mt-5 font-semibold tracking-[-0.02em]">{feature.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.body}</p>
          </Card>
        ))}
      </section>
    </PageContainer>
  );
}
