import { Suspense } from "react";
import { ViewerPage } from "@/components/pages/viewer-page";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-10 text-sm text-muted-foreground">
          Loading viewer...
        </div>
      }
    >
      <ViewerPage />
    </Suspense>
  );
}
