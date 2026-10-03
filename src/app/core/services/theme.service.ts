import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type AppTheme = 'dark' | 'light' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly theme = signal<AppTheme>('dark');
  readonly isDark = signal<boolean>(true);

  constructor() {
    if (this.isBrowser) {
      const savedTheme = (typeof localStorage !== 'undefined' ? localStorage.getItem('cc_theme') : null) as AppTheme || 'system';
      this.theme.set(savedTheme);

      // Listen for system theme changes if matchMedia is supported
      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        try {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', () => {
              if (this.theme() === 'system') {
                this.applyTheme('system');
              }
            });
          }
        } catch {
          // Ignore
        }
      }
    }

    effect(() => {
      const currentTheme = this.theme();
      this.applyTheme(currentTheme);
    });
  }

  setTheme(theme: AppTheme): void {
    this.theme.set(theme);
    if (this.isBrowser && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('cc_theme', theme);
      } catch {
        // Ignore
      }
    }
  }

  private applyTheme(theme: AppTheme): void {
    if (!this.isBrowser) return;

    let darkMode = true;
    if (theme === 'system') {
      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        try {
          darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        } catch {
          darkMode = true;
        }
      }
    } else {
      darkMode = theme === 'dark';
    }

    this.isDark.set(darkMode);
    if (typeof document !== 'undefined' && document.documentElement) {
      const root = document.documentElement;
      if (darkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }
}
