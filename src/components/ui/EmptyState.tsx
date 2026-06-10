import type { ReactNode } from "react";

interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
}

export function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        {icon && <div className="text-4xl">{icon}</div>}
        <p className="text-text-muted font-body">{message}</p>
      </div>
    </div>
  );
}
