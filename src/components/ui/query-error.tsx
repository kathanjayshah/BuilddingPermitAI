import { Button } from "@/components/ui/button";

type Props = {
  message: string;
  onRetry: () => void;
  retrying?: boolean;
};

export function QueryError({ message, onRetry, retrying }: Props) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm"
    >
      <p className="text-destructive">{message}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRetry}
        disabled={retrying}
      >
        {retrying ? "Retrying…" : "Retry"}
      </Button>
    </div>
  );
}
