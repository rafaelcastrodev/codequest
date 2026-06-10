import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { icons } from "@/components/ui/Icon";

interface LessonNavBarProps {
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  isLast?: boolean;
  lastLabel?: string;
  lastIcon?: ReactNode;
  center?: ReactNode;
}

export function LessonNavBar({
  onPrev,
  onNext,
  prevDisabled = false,
  isLast = false,
  lastLabel = "Concluir",
  lastIcon = <icons.check />,
  center,
}: LessonNavBarProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <Button
        variant="ghost"
        size="md"
        disabled={prevDisabled}
        onClick={onPrev}>
        <icons.arrowLeft /> Anterior
      </Button>
      {center}
      <Button variant="primary" size="md" onClick={onNext}>
        {isLast ? (
          <>
            {lastLabel} {lastIcon}
          </>
        ) : (
          <>
            Próximo <icons.arrowRight />
          </>
        )}
      </Button>
    </div>
  );
}
