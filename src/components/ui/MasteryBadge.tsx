import { icons } from '@/components/ui/Icon';
import type { ModuleMastery } from '@/store/progress.store';

export interface MasteryBadgeProps {
  mastery: ModuleMastery;
  size?: 'sm' | 'md';
}

const colorStyles: Record<string, { text: string; bg: string }> = {
  muted:     { text: 'text-text-muted',   bg: 'bg-bg-elevated border-bg-elevated' },
  primary:   { text: 'text-primary',      bg: 'bg-primary/15 border-primary/30' },
  warning:   { text: 'text-warning',      bg: 'bg-warning/15 border-warning/30' },
  secondary: { text: 'text-secondary',    bg: 'bg-secondary/15 border-secondary/30' },
  gold:      { text: 'text-yellow-400',   bg: 'bg-yellow-400/15 border-yellow-400/30' },
};

const iconMap: Record<string, (typeof icons)[keyof typeof icons]> = {
  star: icons.star,
  trophy: icons.trophy,
  crown: icons.crown,
};

const fallbackStyle = colorStyles['muted']!;

export function MasteryBadge({ mastery, size = 'sm' }: MasteryBadgeProps) {
  if (mastery.level === 0) return null;

  const style = colorStyles[mastery.color] ?? fallbackStyle;
  const Icon = iconMap[mastery.icon] ?? icons.star;
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const iconSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1';

  return (
    <span className={`inline-flex items-center gap-1 ${padding} rounded-full border font-body font-semibold ${style.bg} ${style.text} ${textSize}`}>
      <span className={iconSize}><Icon /></span>
      {mastery.title}
    </span>
  );
}
