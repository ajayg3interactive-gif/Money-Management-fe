import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { ToastService } from './toast.service';
import { ProductTourService } from '../../shared/product-tour/product-tour.service';
import { environment } from '../../environments/environment';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    currency: string;
    currencySymbol: string;
    dashboardTourSeen: boolean;
    planTourSeen: boolean;
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
    private productTourService = inject(ProductTourService);
    private apiUrl = environment.apiOrigin + '/api/auth';

    private _currentUser = signal<AuthUser | null>(null);
    private _resolved = signal(false);

    readonly currentUser = this._currentUser.asReadonly();
    readonly isLoggedIn = computed(() => this._currentUser() !== null);
    /** Currency symbol for the logged-in user's preferred currency (set via Settings > Current Balance); defaults to '$'. */
    readonly currencySymbol = computed(() => this._currentUser()?.currencySymbol ?? '$');
    /** True once the initial session check (against the httpOnly cookie) has completed. */
    readonly resolved = this._resolved.asReadonly();

    sendOtp(name: string, email: string): Observable<{ email: string }> {
        return this.http
            .post<ApiSuccess<{ email: string }>>(`${this.apiUrl}/send-otp`, { name, email }, { withCredentials: true })
            .pipe(map(res => res.data));
    }

    verifyOtp(email: string, otp: string): Observable<{ email: string; verified: boolean }> {
        return this.http
            .post<ApiSuccess<{ email: string; verified: boolean }>>(`${this.apiUrl}/verify-otp`, { email, otp }, { withCredentials: true })
            .pipe(map(res => res.data));
    }

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

    updateProfile(name: string, phone: string | null): Observable<AuthUser> {
        return this.http
            .put<ApiSuccess<AuthUser>>(`${this.apiUrl}/me`, { name, phone }, { withCredentials: true })
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

    requestChangeEmail(): Observable<{ email: string }> {
        return this.http
            .post<ApiSuccess<{ email: string }>>(`${this.apiUrl}/change-email/request`, {}, { withCredentials: true })
            .pipe(map(res => res.data));
    }

    /** Public confirm step: the change-email link may be opened on a device with no active session. */
    confirmChangeEmail(token: string, newEmail: string, confirmEmail: string): Observable<{ email: string }> {
        return this.http
            .post<ApiSuccess<{ email: string }>>(`${this.apiUrl}/change-email/confirm`, { token, newEmail, confirmEmail }, { withCredentials: true })
            .pipe(map(res => res.data));
    }

    requestChangePassword(): Observable<{ email: string }> {
        return this.http
            .post<ApiSuccess<{ email: string }>>(`${this.apiUrl}/change-password/request`, {}, { withCredentials: true })
            .pipe(map(res => res.data));
    }

    /** Public confirm step: the reset-password link may be opened on a device with no active session. */
    confirmResetPassword(token: string, newPassword: string, confirmPassword: string): Observable<null> {
        return this.http
            .post<ApiSuccess<null>>(`${this.apiUrl}/reset-password/confirm`, { token, newPassword, confirmPassword }, { withCredentials: true })
            .pipe(map(res => res.data));
    }

    markTourSeen(tourId: string, seen = true): Observable<AuthUser> {
        return this.http
            .patch<ApiSuccess<AuthUser>>(`${this.apiUrl}/me/tour`, { tourId, seen }, { withCredentials: true })
            .pipe(
                map(res => res.data),
                tap(user => this._currentUser.set(user))
            );
    }

    /** Called by the HTTP interceptor when a request comes back 401 mid-session. */
    handleUnauthorized(): void {
        this._currentUser.set(null);
        this._resolved.set(true);
        if (this.router.url.startsWith('/login')) return;
        this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
    }

    private finishLogout(): void {
        this._currentUser.set(null);
        this.productTourService.clearAll();
        this.toast.success('Logged out successfully.');
        this.router.navigate(['/login']);
    }
}
