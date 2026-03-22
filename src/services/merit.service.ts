import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface LeaderboardEntry {
  name: string;
  slug: string;
  balance: number;
  is_bot: boolean;
}

@Injectable({ providedIn: 'root' })
export class MeritService {
  private api = inject(ApiService);

  readonly leaderboard = signal<LeaderboardEntry[]>([]);
  readonly error = signal<string | null>(null);

  loadLeaderboard(limit = 20): void {
    this.error.set(null);
    this.api.get<{ leaderboard: LeaderboardEntry[] }>(`/api/merit/leaderboard?limit=${limit}`).subscribe({
      next: (data) => this.leaderboard.set(data.leaderboard || []),
      error: (err) => this.error.set(err.message || 'Leaderboard unavailable'),
    });
  }
}
