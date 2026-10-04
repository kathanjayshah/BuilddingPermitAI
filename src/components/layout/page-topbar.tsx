"use client";

import { usePathname } from "next/navigation";
import {
  getNavItemForPath,
  getPermitIdFromPath,
} from "@/components/layout/nav-items";
import { SHELL_HEADER_HEIGHT_CLASS } from "@/components/layout/shell-header";
import { usePermits } from "@/hooks/use-permits";
import { cn } from "@/lib/utils";

export function PageTopbar() {
  const pathname = usePathname();
  const permitId = getPermitIdFromPath(pathname);
  const permitsQuery = usePermits(Boolean(permitId));
  const permit = permitsQuery.data?.find((p) => p.id === permitId) ?? null;
  const item = getNavItemForPath(pathname);
  const Icon = item.icon;

  const title = permitId
    ? (permit?.title ?? (permitsQuery.isLoading ? "Loading…" : "Permit"))
    : item.title;
  const description = permitId
    ? `${permit?.documents.length ?? 0} document${
        (permit?.documents.length ?? 0) === 1 ? "" : "s"
      }. Open a PDF to highlight.`
    : item.description;

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex shrink-0 items-center border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        SHELL_HEADER_HEIGHT_CLASS,
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <h1 className="truncate text-lg font-semibold leading-snug tracking-tight">
              {title}
            </h1>
          </div>
          <p className="truncate text-sm leading-snug text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </header>
  );
}
