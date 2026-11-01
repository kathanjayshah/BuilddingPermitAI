import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Optional buttons shown top-right, e.g. "New permit". */
  actions?: ReactNode;
};

export function PageFrame({ children, actions }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
      {actions ? <div className="flex justify-end gap-2">{actions}</div> : null}
      {children}
    </div>
  );
}
