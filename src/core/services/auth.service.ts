import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, of, tap } from 'rxjs';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = 'http://localhost:3000/api/auth';

    private _currentUser = signal<AuthUser | null>(null);
    private _resolved = signal(false);

    readonly currentUser = this._currentUser.asReadonly();
    readonly isLoggedIn = computed(() => this._currentUser() !== null);
    /** True once the initial session check (against the httpOnly cookie) has completed. */
    readonly resolved = this._resolved.asReadonly();

    register(name: string, email: string, password: string): Observable<AuthUser> {
        return this.http
            .post<AuthUser>(`${this.apiUrl}/register`, { name, email, password }, { withCredentials: true })
            .pipe(tap(user => this._currentUser.set(user)));
    }

    login(email: string, password: string): Observable<AuthUser> {
        return this.http
            .post<AuthUser>(`${this.apiUrl}/login`, { email, password }, { withCredentials: true })
            .pipe(tap(user => this._currentUser.set(user)));
    }

    logout(): void {
        this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
            complete: () => this.finishLogout(),
            error: () => this.finishLogout(),
        });
    }

    /** Asks the server whether the httpOnly session cookie is still valid. Call once on app start. */
    fetchCurrentUser(): Observable<AuthUser | null> {
        return this.http.get<AuthUser>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
            tap(user => {
                this._currentUser.set(user);
                this._resolved.set(true);
            }),
            catchError(() => {
                this._currentUser.set(null);
                this._resolved.set(true);
                return of(null);
            })
        );
    }

    /** Called by the HTTP interceptor when a request comes back 401 mid-session. */
    handleUnauthorized(): void {
        this._currentUser.set(null);
        this._resolved.set(true);
        this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
    }

    private finishLogout(): void {
        this._currentUser.set(null);
        this.router.navigate(['/login']);
    }
}
