import { icons, type IconName } from '@/components/ui/Icon';

interface AvatarProps {
  id: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const AVATAR_ICONS: Record<string, IconName> = {
  'robot-1': 'avatarRobot1',
  'coffee': 'avatarCoffee',
  'wizard': 'avatarWizard',
  'ninja': 'avatarNinja',
  'astronaut': 'avatarAstronaut',
  'scientist': 'avatarScientist',
  'hacker': 'avatarHacker',
  'dragon': 'avatarDragon',
};

export const AVATAR_IDS = Object.keys(AVATAR_ICONS);

const sizeClasses = {
  sm: 'w-8 h-8 text-lg',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-16 h-16 text-4xl',
  xl: 'w-24 h-24 text-5xl',
};

export function Avatar({ id, size = 'md', className = '', onClick }: AvatarProps) {
  const iconName = AVATAR_ICONS[id] ?? 'avatarRobot1';
  const IconComponent = icons[iconName];
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick()) : undefined}
      className={`
        ${sizeClasses[size]} rounded-xl bg-bg-elevated border border-bg-elevated
        flex items-center justify-center select-none
        ${onClick ? 'cursor-pointer hover:border-primary transition-colors' : ''}
        ${className}
      `}
    >
      <IconComponent />
    </div>
  );
}
