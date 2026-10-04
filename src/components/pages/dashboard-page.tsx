"use client";

import Link from "next/link";
import { BookOpen, FileText, Sparkles } from "lucide-react";
import { PageFrame } from "@/components/layout/page-frame";
import { Badge } from "@/components/ui/badge";
import { usePermits } from "@/hooks/use-permits";
import { useNorms } from "@/hooks/use-norms";
import { useReviews } from "@/hooks/use-reviews";

const cards = [
  {
    href: "/permits",
    title: "Permits",
    description: "Upload and open permit PDFs",
    icon: FileText,
    key: "permits" as const,
  },
  {
    href: "/norms",
    title: "City norms",
    description: "Paste, upload, or stub web norms",
    icon: BookOpen,
    key: "norms" as const,
  },
  {
    href: "/reviews",
    title: "Reviews",
    description: "Run stub permit vs norm reviews",
    icon: Sparkles,
    key: "reviews" as const,
  },
];

export function DashboardPage() {
  const permits = usePermits(true);
  const norms = useNorms(true);
  const reviews = useReviews(true);

  const counts = {
    permits: permits.data?.length ?? 0,
    norms: norms.data?.length ?? 0,
    reviews: reviews.data?.length ?? 0,
  };

  return (
    <PageFrame>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-lg border p-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-muted-foreground" />
                  <h3 className="font-medium">{card.title}</h3>
                </div>
                <Badge variant="secondary">{counts[card.key]}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {card.description}
              </p>
            </Link>
          );
        })}
      </div>
    </PageFrame>
  );
}
