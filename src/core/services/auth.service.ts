import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { ToastService } from './toast.service';
import { environment } from '../../environments/environment';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    currency: string;
    currencySymbol: string;
}

interface ApiSuccess<T> {
    success: true;
    data: T;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private toast = inject(ToastService);
    private apiUrl = environment.apiOrigin + '/api/auth';

    private _currentUser = signal<AuthUser | null>(null);
    private _resolved = signal(false);

    readonly currentUser = this._currentUser.asReadonly();
    readonly isLoggedIn = computed(() => this._currentUser() !== null);
    /** Currency symbol for the logged-in user's preferred currency (set via Settings > Current Balance); defaults to '$'. */
    readonly currencySymbol = computed(() => this._currentUser()?.currencySymbol ?? '$');
    /** True once the initial session check (against the httpOnly cookie) has completed. */
    readonly resolved = this._resolved.asReadonly();

    register(name: string, email: string, password: string): Observable<AuthUser> {
        return this.http
            .post<ApiSuccess<AuthUser>>(`${this.apiUrl}/register`, { name, email, password }, { withCredentials: true })
            .pipe(
                map(res => res.data),
                tap(user => this._currentUser.set(user))
            );
    }

    login(email: string, password: string): Observable<AuthUser> {
        return this.http
            .post<ApiSuccess<AuthUser>>(`${this.apiUrl}/login`, { email, password }, { withCredentials: true })
            .pipe(
                map(res => res.data),
                tap(user => this._currentUser.set(user))
            );
    }

    logout(): void {
        this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
            complete: () => this.finishLogout(),
            error: () => this.finishLogout(),
        });
    }

    /** Asks the server whether the httpOnly session cookie is still valid. Call once on app start. */
    fetchCurrentUser(): Observable<AuthUser | null> {
        return this.http.get<ApiSuccess<AuthUser>>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
            map(res => res.data),
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

    updateProfile(name: string, email: string, phone: string | null): Observable<AuthUser> {
        return this.http
            .put<ApiSuccess<AuthUser>>(`${this.apiUrl}/me`, { name, email, phone }, { withCredentials: true })
            .pipe(
                map(res => res.data),
                tap(user => this._currentUser.set(user))
            );
    }

    uploadAvatar(file: File): Observable<AuthUser> {
        const formData = new FormData();
        formData.append('avatar', file);
        return this.http
            .post<ApiSuccess<AuthUser>>(`${this.apiUrl}/me/avatar`, formData, { withCredentials: true })
            .pipe(
                map(res => res.data),
                tap(user => this._currentUser.set(user))
            );
    }

    deleteAvatar(): Observable<AuthUser> {
        return this.http
            .delete<ApiSuccess<AuthUser>>(`${this.apiUrl}/me/avatar`, { withCredentials: true })
            .pipe(
                map(res => res.data),
                tap(user => this._currentUser.set(user))
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
        this.toast.success('Logged out successfully.');
        this.router.navigate(['/login']);
    }
}
