import type { NormSource, ReviewStatus } from "@/lib/types";

export type BadgeTone = "neutral" | "success" | "danger";

/** App statuses today, plus the outcomes the task asks us to label ahead of time. */
type ReviewStatusLabelKey = ReviewStatus | "succeeded" | "failed";
type FindingStatus = "pass" | "fail";

const NORM_SOURCE_LABELS: Record<NormSource, string> = {
  paste: "Pasted",
  upload: "Uploaded",
  web_stub: "Web stub",
};

const REVIEW_STATUS_LABELS: Record<ReviewStatusLabelKey, string> = {
  queued: "Queued",
  stubbed: "Stub run",
  succeeded: "Succeeded",
  failed: "Failed",
};

const FINDING_STATUS_LABELS: Record<FindingStatus, string> = {
  pass: "Pass",
  fail: "Fail",
};

export function labelNormSource(source: NormSource): string {
  return NORM_SOURCE_LABELS[source] ?? source;
}

export function labelReviewStatus(status: ReviewStatusLabelKey): string {
  return REVIEW_STATUS_LABELS[status] ?? status;
}

export function labelFindingStatus(status: FindingStatus): string {
  return FINDING_STATUS_LABELS[status] ?? status;
}

export function reviewStatusTone(status: ReviewStatusLabelKey): BadgeTone {
  if (status === "succeeded") return "success";
  if (status === "failed") return "danger";
  return "neutral";
}

export function findingStatusTone(status: FindingStatus): BadgeTone {
  if (status === "pass") return "success";
  if (status === "fail") return "danger";
  return "neutral";
}

export function toneBadgeProps(tone: BadgeTone) {
  switch (tone) {
    case "success":
      return {
        variant: "outline" as const,
        className:
          "border-green-600/30 bg-green-600/10 text-green-700 dark:text-green-400",
      };
    case "danger":
      return { variant: "destructive" as const, className: "" };
    default:
      return { variant: "secondary" as const, className: "" };
  }
}