import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GameScore {
  id: number;
  gameType: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  datePlayed: string;
  username: string;
}

export interface UserStats {
  totalGamesPlayed: number;
  averageScore: number;
  bestScore: number;
  favoriteGameType: string;
  totalCorrectAnswers: number;
  totalQuestions: number;
}

export interface ScoreSubmission {
  gameType: string;
  score: number;
  totalQuestions: number;
}

@Injectable({
  providedIn: 'root',
})
export class ScoreService {
  private apiUrl = `${environment.API_URL}/scores`;

  constructor(
    private http: HttpClient
  ) {}

  async submitScore(scoreData: ScoreSubmission): Promise<any> {
    return this.http.post(`${this.apiUrl}/submit`, scoreData).toPromise();
  }

  async getUserStats(): Promise<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/user-stats`).toPromise() as Promise<UserStats>;
  }

  async getRecentScores(limit: number = 5): Promise<GameScore[]> {
    return this.http.get<GameScore[]>(`${this.apiUrl}/recent?limit=${limit}`).toPromise() as Promise<GameScore[]>;
  }

  async getTopScores(limit: number = 10): Promise<GameScore[]> {
    return this.http.get<GameScore[]>(`${this.apiUrl}/top?limit=${limit}`).toPromise() as Promise<GameScore[]>;
  }

  async getAllUserScores(): Promise<GameScore[]> {
    return this.http.get<GameScore[]>(`${this.apiUrl}/user`).toPromise() as Promise<GameScore[]>;
  }
}
