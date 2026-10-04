import { Suspense } from "react";
import { PermitPdfPage } from "@/components/pages/permit-pdf-page";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100dvh-4.75rem)] items-center justify-center px-4 text-sm text-muted-foreground">
          Loading permit…
        </div>
      }
    >
      <PermitPdfPage permitId={decodeURIComponent(id)} />
    </Suspense>
  );
}
