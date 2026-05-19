import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export interface AdminDTO {
  id: number;
  username: string;
  displayName: string;
}

export interface TokensDTO {
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _user = signal<AdminDTO | null>(null);
  readonly user = this._user.asReadonly();

  private fetchPromise: Promise<boolean> | null = null;

  signin(username: string, password: string) {
    return this.http.post<TokensDTO>('/api/admin/signin', { username, password });
  }

  private meApi() {
    return this.http.get<AdminDTO>('/api/admin/me');
  }

  private logoutApi() {
    return this.http.post<void>('/api/admin/logout', {});
  }

  async fetch(): Promise<boolean> {
    if (this.fetchPromise) return this.fetchPromise;

    this.fetchPromise = firstValueFrom(this.meApi())
      .then(admin => {
        this._user.set(admin);
        this.fetchPromise = null;
        return true;
      })
      .catch(() => {
        this.clearSession();
        this.fetchPromise = null;
        return false;
      });

    return this.fetchPromise;
  }

  // 로그인 후 사용 — 새 토큰으로 즉시 fresh fetch 보장
  async loginAndFetch(tokens: TokensDTO): Promise<boolean> {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    this.fetchPromise = null;
    return this.fetch();
  }

  clearSession() {
    this._user.set(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async logout() {
    try {
      await firstValueFrom(this.logoutApi());
    } finally {
      this.clearSession();
      this.router.navigate(['/sign-in']);
    }
  }
}
