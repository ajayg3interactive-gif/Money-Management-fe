import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
}

const STORAGE_KEY = 'mm_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = 'http://localhost:3000/api/auth';

    private _currentUser = signal<AuthUser | null>(this.readStoredUser());

    readonly currentUser = this._currentUser.asReadonly();
    readonly isLoggedIn = computed(() => this._currentUser() !== null);

    register(name: string, email: string, password: string): Observable<AuthUser> {
        return this.http.post<AuthUser>(`${this.apiUrl}/register`, { name, email, password });
    }

    login(email: string, password: string): Observable<AuthUser> {
        return this.http
            .post<AuthUser>(`${this.apiUrl}/login`, { email, password })
            .pipe(tap(user => this.persistSession(user)));
    }

    logout(): void {
        localStorage.removeItem(STORAGE_KEY);
        this._currentUser.set(null);
        this.router.navigate(['/login']);
    }

    private persistSession(user: AuthUser): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this._currentUser.set(user);
    }

    private readStoredUser(): AuthUser | null {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        try {
            return JSON.parse(stored) as AuthUser;
        } catch {
            return null;
        }
    }
}
