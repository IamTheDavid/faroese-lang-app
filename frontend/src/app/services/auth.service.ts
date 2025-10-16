import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = `${environment.API_URL}/auth`;
    private tokenKey = 'auth_token';

    constructor(
        private http: HttpClient,
        private storage: StorageService = inject(StorageService)
    ) { }

    register(user: { username: string; email: string; password: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, user);
    }

    login(credentials: { username: string; password: string }): Observable<{ token: string }> {
        return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials).pipe(
            tap(async (response) => {
                if (response.token) {
                    await this.setToken(response.token);
                }
            })
        );
    }

    async setToken(token: string) {
        this.storage.set(this.tokenKey, token);
    }

    async getToken(): Promise<string | null> {
        return this.storage.get(this.tokenKey);
    }

    async logout() {
        this.storage.remove(this.tokenKey);
    }

    async isLoggedIn(): Promise<boolean> {
        const token = await this.getToken();
        return !!token;
    }
}
