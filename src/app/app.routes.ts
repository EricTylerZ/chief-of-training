import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../components/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'quest/:slug',
    loadComponent: () => import('../components/quest-player/quest-player.component').then(m => m.QuestPlayerComponent),
    canActivate: [authGuard],
  },
  {
    path: 'quest/:slug/complete',
    loadComponent: () => import('../components/quest-complete/quest-complete.component').then(m => m.QuestCompleteComponent),
    canActivate: [authGuard],
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('../components/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('../components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('../components/login/login.component').then(m => m.LoginComponent),
  },
];
