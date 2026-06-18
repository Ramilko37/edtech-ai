import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-blueElectric/20 bg-blueElectric/[0.08] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-blueCore",
        className,
      )}
      {...props}
    />
  );
}
