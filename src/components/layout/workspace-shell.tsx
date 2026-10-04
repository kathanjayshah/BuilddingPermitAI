"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { PageTopbar } from "@/components/layout/page-topbar";
import { SessionGate } from "@/components/auth/session-gate";
import { useSession } from "@/hooks/use-session";

/**
 * Next.js-style app shell: sidebar + per-page top bar around children.
 * Brand + account live at the bottom of the sidebar.
 */
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const email = session.data?.email ?? null;

  if (session.isLoading) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading session...
      </div>
    );
  }

  if (!email) {
    return <SessionGate />;
  }

  return (
    <div className="flex min-h-full flex-1">
      <Sidebar email={email} />
      <div className="flex min-w-0 flex-1 flex-col">
        <PageTopbar />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
