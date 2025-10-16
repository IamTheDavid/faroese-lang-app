import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PhraseService } from '../../services/phrase.service';
import { AuthService } from '../../services/auth.service';
import { ScoreService } from '../../services/score.service';
import { LoadingComponent } from '../../components/loading/loading.component';

@Component({
  standalone: true,
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  imports: [CommonModule, IonicModule, LoadingComponent],
})
export class QuizComponent implements OnInit {
  private readonly phraseService = inject(PhraseService);
  private readonly authService = inject(AuthService);
  private readonly scoreService = inject(ScoreService);
  private readonly cdr = inject(ChangeDetectorRef);
  
  currentPhrase: { en: string; fo: string } | null = null;
  options: string[] = [];
  feedback: string = '';
  tries: number = 0;
  correctCount: number = 0;
  questionCount: number = 0;
  maxQuestions: number = 10;
  quizComplete: boolean = false;
  wrongAnswer: boolean = false;
  isLoading: boolean = true;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadNewQuestion();
  }

  loadNewQuestion() {
    if (this.questionCount >= this.maxQuestions) {
      this.quizComplete = true;
      this.isLoading = false;
      this.submitFinalScore();
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.feedback = '';
    this.tries = 0;
    this.wrongAnswer = false;

    this.phraseService.getQuestion().subscribe({
      next: (data) => {
        this.currentPhrase = { en: data.en, fo: data.fo };
        this.options = data.options;
        this.questionCount++;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  async submitFinalScore() {
    const isLoggedIn = await this.authService.isLoggedIn();
    if (isLoggedIn) {
      try {
        await this.scoreService.submitScore({
          gameType: 'quiz',
          score: this.correctCount,
          totalQuestions: this.maxQuestions
        });
      } catch (error) {
      }
    }
  }


  checkAnswer(answer: string) {
    if (!this.currentPhrase || this.quizComplete) return;

    if (answer === this.currentPhrase.fo) {
      this.feedback = 'Correct!';
      this.correctCount++;
      this.wrongAnswer = false;
      this.cdr.detectChanges();
      setTimeout(() => this.loadNewQuestion(), 700);
    } else {
      this.tries++;
      this.wrongAnswer = true;

      if (this.tries >= 2) {
        this.feedback = `Wrong! The correct answer is: ${this.currentPhrase.fo}`;
        this.cdr.detectChanges();
        setTimeout(() => this.loadNewQuestion(), 2500);
      } else {
        this.feedback = 'Wrong, try again!';
        this.cdr.detectChanges();
      }
    }
  }

  restartQuiz() {
    this.correctCount = 0;
    this.questionCount = 0;
    this.quizComplete = false;
    this.isLoading = true;
    this.cdr.detectChanges();
    this.loadNewQuestion();
  }
}
