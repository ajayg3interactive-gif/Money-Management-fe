import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error';

export interface Toast {
  id: number;
  type: ToastType;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private nextId = 0;

  success(text: string, duration = 3500): void {
    this.show('success', text, duration);
  }

  error(text: string, duration = 4500): void {
    this.show('error', text, duration);
  }

  dismiss(id: number): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  private show(type: ToastType, text: string, duration: number): void {
    const id = ++this.nextId;
    this._toasts.update(list => [...list, { id, type, text }]);
    setTimeout(() => this.dismiss(id), duration);
  }
}
