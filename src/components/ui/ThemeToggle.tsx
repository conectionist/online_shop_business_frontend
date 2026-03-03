import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore, type Theme } from '@/stores/themeStore';

interface ThemeToggleProps {
  className?: string;
}

const OPTIONS: { value: Theme; Icon: typeof Sun; label: string }[] = [
  { value: 'light', Icon: Sun, label: 'Modul zi' },
  { value: 'system', Icon: Monitor, label: 'Automat' },
  { value: 'dark', Icon: Moon, label: 'Modul noapte' },
];

/**
 * A three-state theme toggle: Light / System (auto) / Dark.
 *
 * The "System" state currently follows the OS preference. It is designed
 * as the hook for future automation (time-based, region-based, etc.) —
 * when automation is added, it will activate through the 'system' state
 * without any change to this component.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div
      className={`inline-flex items-center p-1 rounded-full ring-1 ring-black/10 dark:ring-white/10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm gap-px ${className}`}
      role="group"
      aria-label="Selectează tema vizuală"
    >
      {OPTIONS.map(({ value, Icon, label }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            title={label}
            aria-label={label}
            aria-pressed={active}
            className={`
              flex items-center justify-center w-7 h-7 rounded-full
              transition-all duration-200 ease-out
              ${
                active
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-amber-500 dark:text-amber-400 scale-110'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-105'
              }
            `}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={active ? 2.5 : 2} />
          </button>
        );
      })}
    </div>
  );
};
