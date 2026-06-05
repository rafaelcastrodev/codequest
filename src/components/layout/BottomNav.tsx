import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NavTabProps {
  to: string;
  icon: string;
  label: string;
  active: boolean;
}

function NavTab({ to, icon, label, active }: NavTabProps) {
  return (
    <Link to={to} className="flex-1 flex flex-col items-center gap-0.5 py-2 relative">
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
    </Link>
  );
}

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-bg-surface/95 backdrop-blur-md border-t border-bg-elevated flex items-center safe-bottom">
      <NavTab to="/" icon="🗺️" label="Mapa" active={pathname === '/'} />
      <NavTab to="/profile" icon="👤" label="Perfil" active={pathname === '/profile'} />
      <NavTab to="/settings" icon="⚙️" label="Config" active={pathname === '/settings'} />
    </nav>
  );
}
