"use client";

import { usePathname } from "next/navigation";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { getNavItemForPath } from "@/components/layout/nav-items";

export function PageTopbar() {
  const pathname = usePathname();
  const item = getNavItemForPath(pathname);
  const fetching = useIsFetching();
  const mutating = useIsMutating();
  const Icon = item.icon;

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <h1 className="truncate text-lg font-semibold tracking-tight">
              {item.title}
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {item.description}
          </p>
        </div>
        <p className="shrink-0 pt-1 text-xs text-muted-foreground">
          {fetching > 0 || mutating > 0
            ? "Syncing..."
            : "TanStack Query idle (cached)"}
        </p>
      </div>
    </header>
  );
}
