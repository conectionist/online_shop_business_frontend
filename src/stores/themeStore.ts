import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  /** The user's explicit theme preference */
  theme: Theme;
  /** Set a specific theme */
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'theme-storage' }
  )
);

/**
 * Resolve the actual theme to apply based on the user's preference.
 *
 * This function is the extension point for automated theme switching:
 * - Currently: 'system' follows the OS preference (prefers-color-scheme)
 * - Future: override 'system' with time-based logic (e.g., dark after sunset)
 * - Future: override 'system' with region/timezone-based rules
 * - Future: pull automation rules from backend settings
 */
export function resolveTheme(preference: Theme): 'light' | 'dark' {
  if (preference !== 'system') return preference;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
