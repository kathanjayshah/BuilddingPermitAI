"use client";

import { usePathname } from "next/navigation";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { getNavItemForPath } from "@/components/layout/nav-items";
import { SHELL_HEADER_HEIGHT_CLASS } from "@/components/layout/shell-header";
import { cn } from "@/lib/utils";

export function PageTopbar() {
  const pathname = usePathname();
  const item = getNavItemForPath(pathname);
  const fetching = useIsFetching();
  const mutating = useIsMutating();
  const Icon = item.icon;

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex shrink-0 items-center border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        SHELL_HEADER_HEIGHT_CLASS,
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <h1 className="truncate text-lg font-semibold leading-snug tracking-tight">
              {item.title}
            </h1>
          </div>
          <p className="truncate text-sm leading-snug text-muted-foreground">
            {item.description}
          </p>
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">
          {fetching > 0 || mutating > 0
            ? "Syncing..."
            : "TanStack Query idle (cached)"}
        </p>
      </div>
    </header>
  );
}
