import {
  BookOpen,
  FileText,
  Highlighter,
  LayoutDashboard,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    title: "Dashboard",
    description:
      "Building Permit AI workspace. Use the sidebar to open each page.",
    icon: LayoutDashboard,
  },
  {
    href: "/permits",
    label: "Permits",
    title: "Permits",
    description:
      "Upload permit PDFs. Click a row to open it in the PDF viewer page.",
    icon: FileText,
  },
  {
    href: "/norms",
    label: "City norms",
    title: "City norms",
    description:
      "Attach city-norm context by paste, upload, or web-fetch stub.",
    icon: BookOpen,
  },
  {
    href: "/viewer",
    label: "PDF viewer",
    title: "PDF viewer",
    description: "Scroll pages in a fixed pane, then drag to highlight.",
    icon: Highlighter,
  },
  {
    href: "/reviews",
    label: "Reviews",
    title: "Reviews",
    description:
      "Select a permit and norms, then record a stub review run.",
    icon: Sparkles,
  },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getNavItemForPath(pathname: string): NavItem {
  const match = navItems.find((item) => isNavActive(pathname, item.href));
  return match ?? navItems[0]!;
}
