import React, { useEffect } from 'react';
import { useThemeStore, resolveTheme } from '@/stores/themeStore';

/**
 * ThemeProvider applies the resolved theme as a CSS class on <html>.
 * It also watches for OS-level preference changes when 'system' mode is active.
 *
 * Wrap your app root with this provider once:
 *   <ThemeProvider><App /></ThemeProvider>
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const apply = () => {
      const resolved = resolveTheme(theme);
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    };

    apply();

    // When 'system' is selected, keep in sync with OS preference changes
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);

  return <>{children}</>;
};
