import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'home',
        loadChildren: () =>
            import('./home/home.module').then((m) => m.HomePageModule),
    },
    {
        path: 'quiz',
        loadComponent: () =>
            import('./pages/quiz/quiz.component').then((m) => m.QuizComponent),
    },
        {
        path: 'word-game',
        loadComponent: () =>
            import('./pages/word-game/word-game.component').then((m) => m.WordGameComponent),
    },
    {
        path: 'translation-game',
        loadComponent: () =>
            import('./pages/translation-game/translation-game.component').then((m) => m.TranslationGameComponent),
    },
    {
        path: 'scoreboard',
        loadComponent: () =>
            import('./pages/scoreboard/scoreboard.component').then((m) => m.ScoreboardComponent),
    },
    {
        path: 'login',
        loadComponent: () =>
            import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
    },
    {
        path: 'register',
        loadComponent: () =>
            import('./pages/auth/register/register.component').then((m) => m.RegisterComponent),
    },
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full',
    },
    {
        path: '**',
        redirectTo: '/home',
    },
];
