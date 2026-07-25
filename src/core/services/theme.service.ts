import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _isDark = signal(this.readInitial());
  readonly isDark = this._isDark.asReadonly();

  constructor() {
    this.apply(this._isDark());
  }

  toggle(): void {
    this.set(!this._isDark());
  }

  set(isDark: boolean): void {
    this._isDark.set(isDark);
    this.apply(isDark);
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  }

  private apply(isDark: boolean): void {
    document.documentElement.classList.toggle('dark', isDark);
  }

  private readInitial(): boolean {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}
