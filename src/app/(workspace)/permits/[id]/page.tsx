import { PermitPdfPage } from "@/components/pages/permit-pdf-page";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <PermitPdfPage permitId={decodeURIComponent(id)} />;
}
