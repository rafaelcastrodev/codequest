interface LessonBreadcrumbProps {
  moduleTitle: string;
  current: number;
  total: number;
}

export function LessonBreadcrumb({ moduleTitle, current, total }: LessonBreadcrumbProps) {
  return (
    <span className="text-xs text-text-muted font-body truncate">
      {moduleTitle} — Lição {current} de {total}
    </span>
  );
}
