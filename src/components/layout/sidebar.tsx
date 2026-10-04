"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { isNavActive, navItems } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/use-session";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";

type Props = {
  email: string;
};

export function Sidebar({ email }: Props) {
  const pathname = usePathname();
  const signOut = useSignOut();
  const { collapsed, toggle } = useSidebarCollapsed();

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
          collapsed ? "justify-center px-2 py-3" : "justify-between px-3 py-3",
        )}
      >
        {!collapsed ? (
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Workspace
            </p>
            <p className="mt-1 truncate text-sm font-semibold">Permit review</p>
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
        className={cn(
          "flex flex-1 flex-col gap-1",
          collapsed ? "p-2" : "p-3",
        )}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(pathname, item.href);
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
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "mt-auto space-y-3 border-t",
          collapsed ? "p-2" : "p-3",
        )}
      >
        {!collapsed ? (
          <>
            <div>
              <p className="text-sm font-semibold tracking-tight">
                Building Permit AI
              </p>
              <p className="text-xs text-muted-foreground">
                Review permits against city norms
              </p>
            </div>
            <p className="truncate text-xs text-muted-foreground" title={email}>
              {email}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              disabled={signOut.isPending}
              onClick={() => signOut.mutate()}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
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
