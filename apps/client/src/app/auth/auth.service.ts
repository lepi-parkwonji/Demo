import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from './auth.constants';

export interface UserDTO {
  id: string;
  nickname: string;
  email?: string;
  profileImage?: string;
}

export interface TokensDTO {
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _user = signal<UserDTO | null>(null);
  readonly user = this._user.asReadonly();

  private fetchPromise: Promise<boolean> | null = null;

  getKakaoLoginUrl(redirectUri: string) {
    return this.http.get<{ url: string }>('/api/client/auth/kakao-url', { params: { redirectUri } });
  }

  kakaoLogin(code: string, redirectUri: string) {
    return this.http.post<TokensDTO>('/api/client/auth/kakao', { code, redirectUri });
  }

  saveTokens(tokens: TokensDTO) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      this.fetchPromise = null;
    }
  }

  private meApi() {
    return this.http.get<UserDTO>('/api/client/me');
  }

  private logoutApi() {
    return this.http.post<void>('/api/client/logout', {});
  }

  async fetch(): Promise<boolean> {
    if (this.fetchPromise) return this.fetchPromise;

    this.fetchPromise = firstValueFrom(this.meApi())
      .then(user => {
        this._user.set(user);
        this.fetchPromise = null;
        return true;
      })
      .catch(() => {
        this._user.set(null);
        this.fetchPromise = null;
        return false;
      });

    return this.fetchPromise;
  }

  async logout() {
    try {
      await firstValueFrom(this.logoutApi());
    } finally {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
      this._user.set(null);
      this.router.navigate(['/']);
    }
  }
}
