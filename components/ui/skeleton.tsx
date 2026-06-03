import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-xl bg-white/[0.08] shadow-inner shadow-white/[0.03]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
