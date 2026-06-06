import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NavTabProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavTab({ icon, label, active, onClick }: NavTabProps) {
  return (
    <button
      onClick={() => {
        if (!active) onClick();
      }}
      className="flex-1 flex flex-col items-center gap-0.5 py-2 relative"
    >
      {active && (
        <motion.div
          layoutId="bottom-nav-indicator"
          className="absolute -top-0.5 w-8 h-1 rounded-full bg-primary"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <span className={`text-xl transition-transform ${active ? 'scale-110' : ''}`}>{icon}</span>
      <span
        className={`text-[10px] font-body font-semibold transition-colors ${
          active ? 'text-primary' : 'text-[#8888AA]'
        }`}
      >
        {label}
      </span>
    </button>
  );
}

interface BottomNavProps {
  onNavigate?: () => void;
}

export function BottomNav({ onNavigate }: BottomNavProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const go = (to: string) => {
    onNavigate?.();
    navigate(to, { replace: true });
  };

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-bg-surface/95 backdrop-blur-md border-t border-bg-elevated flex items-center safe-bottom">
      <NavTab icon="🗺️" label="Jornada" active={pathname === '/'} onClick={() => go('/')} />
      <NavTab icon="🧪" label="Play" active={pathname === '/playground'} onClick={() => go('/playground')} />
      <NavTab icon="👤" label="Perfil" active={pathname === '/profile'} onClick={() => go('/profile')} />
      <NavTab icon="ℹ️" label="Sobre" active={pathname === '/about'} onClick={() => go('/about')} />
      <NavTab icon="⚙️" label="Config" active={pathname === '/settings'} onClick={() => go('/settings')} />
    </nav>
  );
}
