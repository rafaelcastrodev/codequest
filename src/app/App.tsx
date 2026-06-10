import { useEffect } from 'react';
import { AppRouter } from './Router';
import { useSettingsStore } from '@/store/settings.store';

export function App() {
  const appTheme = useSettingsStore((s) => s.appTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appTheme);
  }, [appTheme]);

  return <AppRouter />;
}
