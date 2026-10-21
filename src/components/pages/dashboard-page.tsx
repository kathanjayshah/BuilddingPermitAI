"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PageFrame } from "@/components/layout/page-frame";
import { buttonVariants } from "@/components/ui/button";
import { usePermits } from "@/hooks/use-permits";
import { useNorms } from "@/hooks/use-norms";
import { useReviews } from "@/hooks/use-reviews";
import { cn } from "@/lib/utils";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function DashboardPage() {
  const permits = usePermits(true);
  const norms = useNorms(true);
  const reviews = useReviews(true);

  const loading = permits.isLoading || norms.isLoading || reviews.isLoading;
  const nPermits = permits.data?.length ?? 0;
  const nNorms = norms.data?.length ?? 0;
  const nReviews = reviews.data?.length ?? 0;

  const steps = [
    {
      title: "Add city norms",
      desc: "Paste, upload, or link the rules permits are checked against.",
      status: plural(nNorms, "norm"),
      done: nNorms > 0,
      ready: true,
      href: "/norms",
      cta: "Add norms",
    },
    {
      title: "Upload a permit",
      desc: "Add the permit PDF you want to review.",
      status: plural(nPermits, "permit"),
      done: nPermits > 0,
      ready: true,
      href: "/permits",
      cta: "Upload permit",
    },
    {
      title: "Run a review",
      desc: "Compare a permit against your norms and see findings.",
      status: plural(nReviews, "review"),
      done: nReviews > 0,
      ready: nNorms > 0 && nPermits > 0,
      href: "/reviews",
      cta: "Run review",
    },
  ];

  const currentIndex = loading ? -1 : steps.findIndex((s) => !s.done);

  return (
    <PageFrame>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => {
          const current = i === currentIndex;
          return (
            <div
              key={s.title}
              className={cn(
                "flex flex-col gap-4 rounded-xl border p-5 transition-colors",
                current && "border-primary/50 ring-2 ring-primary/15",
              )}
            >
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-sm font-medium",
                    s.done
                      ? "bg-green-600/10 text-green-600"
                      : current
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {s.done ? <Check className="size-4" /> : i + 1}
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {loading ? "…" : s.status}
                </span>
              </div>

              <div className="flex-1 space-y-1">
                <h3 className="font-medium">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>

              {s.ready ? (
                <Link
                  href={s.href}
                  className={cn(
                    buttonVariants({
                      variant: current ? "default" : "outline",
                      size: "sm",
                    }),
                    "w-fit",
                  )}
                >
                  {s.done ? "Manage" : s.cta}
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Add norms and a permit first.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </PageFrame>
  );
}
