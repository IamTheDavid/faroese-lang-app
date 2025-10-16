import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ScoreService } from '../../services/score.service';

interface GameScore {
  id: number;
  gameType: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  datePlayed: string;
  username: string;
}

interface UserStats {
  totalGamesPlayed: number;
  averageScore: number;
  bestScore: number;
  favoriteGameType: string;
  totalCorrectAnswers: number;
  totalQuestions: number;
}

@Component({
  standalone: true,
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  imports: [CommonModule, IonicModule],
})
export class ScoreboardComponent implements OnInit {
  userStats: UserStats | null = null;
  recentScores: GameScore[] = [];
  topScores: GameScore[] = [];
  isLoggedIn: boolean = false;
  loading: boolean = true;

  constructor(
    private authService: AuthService,
    private scoreService: ScoreService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkAuthAndLoadData();
  }

  async checkAuthAndLoadData() {
    this.isLoggedIn = await this.authService.isLoggedIn();
    
    if (this.isLoggedIn) {
      await this.loadUserStats();
      await this.loadRecentScores();
      await this.loadTopScores();
    }
    
    this.loading = false;
  }

  async loadUserStats() {
    try {
      this.userStats = await this.scoreService.getUserStats();
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }

  async loadRecentScores() {
    try {
      this.recentScores = await this.scoreService.getRecentScores(5);
    } catch (error) {
      console.error('Error loading recent scores:', error);
    }
  }

  async loadTopScores() {
    try {
      this.topScores = await this.scoreService.getTopScores(10);
    } catch (error) {
      console.error('Error loading top scores:', error);
    }
  }

  getGameTypeDisplayName(gameType: string): string {
    switch (gameType) {
      case 'quiz':
        return 'Sentence Matching';
      case 'word-game':
        return 'Word Selection';
      case 'translation-game':
        return 'Translation Challenge';
      default:
        return gameType;
    }
  }

  getGameTypeIcon(gameType: string): string {
    switch (gameType) {
      case 'quiz':
        return '🎮';
      case 'word-game':
        return '🎯';
      case 'translation-game':
        return '✍️';
      default:
        return '🎲';
    }
  }

  getScoreColor(percentage: number): string {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 50) return 'text-orange-400';
    return 'text-red-400';
  }

  getScoreBadge(percentage: number): string {
    if (percentage >= 90) return '🏆';
    if (percentage >= 70) return '🥈';
    if (percentage >= 50) return '🥉';
    return '📚';
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
