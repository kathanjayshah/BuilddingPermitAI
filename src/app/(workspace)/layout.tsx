import { WorkspaceShell } from "@/components/layout/workspace-shell";

/**
 * Next.js App Router nested layout:
 * shared sidebar + top bar around all workspace pages.
 */
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
