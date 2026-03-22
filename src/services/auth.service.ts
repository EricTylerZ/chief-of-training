import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface UserInfo {
  meritId: string;
  fullName: string;
  email: string;
  personSlug: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);

  readonly user = signal<UserInfo | null>(null);
  readonly loading = signal(true);
  readonly isLoggedIn = computed(() => this.user() !== null);

  /** Check if the user is authenticated via EZ Merit SSO cookie. */
  checkAuth(): void {
    this.loading.set(true);
    this.api.get<UserInfo>('/api/auth/me').subscribe({
      next: (data) => {
        if (data?.meritId) {
          this.user.set(data);
        }
        this.loading.set(false);
      },
      error: () => {
        this.user.set(null);
        this.loading.set(false);
      },
    });
  }

  /** Get the EZ Merit login URL with redirect back to current page. */
  getLoginUrl(redirectPath?: string): string {
    const redirect = redirectPath || window.location.pathname;
    return `https://ezmerit.ericzosso.com/login?redirect=${encodeURIComponent(
      `https://chiefoftraining.ericzosso.com${redirect}`
    )}`;
  }
}
