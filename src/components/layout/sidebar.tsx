"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { isNavActive, navItems } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/use-session";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";
import { usePermits } from "@/hooks/use-permits";
import { useNorms } from "@/hooks/use-norms";
import { useReviews } from "@/hooks/use-reviews";
import { SHELL_HEADER_HEIGHT_CLASS } from "@/components/layout/shell-header";

type Props = {
  email: string;
};

export function Sidebar({ email }: Props) {
  const pathname = usePathname();
  const signOut = useSignOut();
  const { collapsed, toggle } = useSidebarCollapsed();

  const permits = usePermits(true);
  const norms = useNorms(true);
  const reviews = useReviews(true);
  const counts: Record<string, number | undefined> = {
    "/permits": permits.data?.length,
    "/norms": norms.data?.length,
    "/reviews": reviews.data?.length,
  };

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r bg-muted/20 transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex items-center border-b",
          SHELL_HEADER_HEIGHT_CLASS,
          collapsed ? "justify-center px-2" : "justify-between px-3",
        )}
      >
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-snug tracking-tight">
              Building Permit AI
            </p>
            <p className="text-xs text-muted-foreground">Permit review</p>
          </div>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>
      </div>

      <nav
        className={cn("flex flex-1 flex-col gap-1", collapsed ? "p-2" : "p-3")}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(pathname, item.href);
          const count = counts[item.href];
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex items-center rounded-md text-sm transition-colors hover:bg-muted",
                collapsed ? "justify-center px-2 py-2" : "gap-2 px-3 py-2",
                active
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed ? <span className="flex-1">{item.label}</span> : null}
              {!collapsed && count != null ? (
                <span className="text-xs tabular-nums text-muted-foreground">
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className={cn("mt-auto border-t", collapsed ? "p-2" : "p-3")}>
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary uppercase">
              {email[0]}
            </div>
            <p
              className="min-w-0 flex-1 truncate text-xs text-muted-foreground"
              title={email}
            >
              {email}
            </p>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={signOut.isPending}
              onClick={() => signOut.mutate()}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={signOut.isPending}
              onClick={() => signOut.mutate()}
              aria-label="Sign out"
              title={`${email} · Sign out`}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
