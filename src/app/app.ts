import { Component, computed, inject, signal } from '@angular/core';
import { SideBar } from "../shared/side-bar/side-bar";
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastComponent } from '../shared/toast/toast';

const AUTH_ROUTES = ['/login', '/signup'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SideBar, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Money-Management');

  protected readonly isSidebarOpen = signal(false);

  protected toggleSidebar(): void {
    this.isSidebarOpen.update((open) => !open);
  }

  protected closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  private router = inject(Router);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ),
    { initialValue: null }
  );

  protected readonly isAuthRoute = computed(() =>
    AUTH_ROUTES.some(route => (this.currentUrl()?.urlAfterRedirects ?? this.router.url).startsWith(route))
  );
}
