import { Component, inject, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhraseService } from '../../services/phrase.service';
import { AuthService } from '../../services/auth.service';
import { ScoreService } from '../../services/score.service';
import { LoadingComponent } from '../../components/loading/loading.component';

interface TranslationGameQuestion {
  en: string;
  correctAnswer: string;
  hints: string[];
}

@Component({
  standalone: true,
  selector: 'app-translation-game',
  templateUrl: './translation-game.component.html',
  imports: [CommonModule, IonicModule, FormsModule, LoadingComponent],
})
export class TranslationGameComponent implements OnInit {
  private readonly phraseService = inject(PhraseService);
  private readonly authService = inject(AuthService);
  private readonly scoreService = inject(ScoreService);
  private readonly cdr = inject(ChangeDetectorRef);

  currentQuestion: TranslationGameQuestion | null = null;
  userAnswer: string = '';
  feedback: string = '';
  questionCount: number = 0;
  correctCount: number = 0;
  maxQuestions: number = 10;
  quizComplete: boolean = false;
  wrongAnswer: boolean = false;
  showHints: boolean = false;
  isAnswered: boolean = false;
  isLoading: boolean = true;

  @ViewChild('answerInput') answerInput?: ElementRef<HTMLInputElement>;

  ngOnInit() {
    this.loadNewQuestion();
  }

  private focusAnswerInput() {
    setTimeout(() => {
      this.answerInput?.nativeElement?.focus();
    }, 0);
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
    this.userAnswer = '';
    this.wrongAnswer = false;
    this.showHints = false;
    this.isAnswered = false;

  this.phraseService.getTranslationGameQuestion().subscribe({
      next: (data) => {
        this.currentQuestion = data;
        this.questionCount++;
        this.isLoading = false;
        this.cdr.detectChanges();
    this.focusAnswerInput();
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
          gameType: 'translation-game',
          score: this.correctCount,
          totalQuestions: this.maxQuestions,
        });
      } catch (error) {
        console.error('Error submitting score:', error);
      }
    }
  }

  checkAnswer() {
    if (!this.currentQuestion || this.isAnswered) return;

    const userInput = this.userAnswer.trim().toLowerCase();
    const correctAnswer = this.currentQuestion.correctAnswer.toLowerCase();

    const isCorrect =
      userInput === correctAnswer ||
      this.isCloseMatch(userInput, correctAnswer);

    this.isAnswered = true;
    this.wrongAnswer = !isCorrect;

    if (isCorrect) {
      this.correctCount++;
      this.feedback = 'Correct! Well done!';

      setTimeout(() => this.loadNewQuestion(), 1500);
    } else {
      this.feedback = `Incorrect. The correct answer is: "${this.currentQuestion.correctAnswer}"`;
    }
  }

  nextQuestion() {
    this.loadNewQuestion();
  }

  private isCloseMatch(input: string, correct: string): boolean {
    const cleanInput = input
      .replace(/[.,!?;:"'()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const cleanCorrect = correct
      .replace(/[.,!?;:"'()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanInput === cleanCorrect) {
      return true;
    }

    if (Math.abs(cleanInput.length - cleanCorrect.length) > 2) return false;

    let differences = 0;
    const maxLength = Math.max(cleanInput.length, cleanCorrect.length);

    for (let i = 0; i < maxLength; i++) {
      if (cleanInput[i] !== cleanCorrect[i]) differences++;
      if (differences > 2) return false;
    }

    return differences <= 2;
  }

  toggleHints() {
    this.showHints = !this.showHints;
    if (!this.isAnswered) {
      this.focusAnswerInput();
    }
  }

  restartGame() {
    this.correctCount = 0;
    this.questionCount = 0;
    this.quizComplete = false;
    this.loadNewQuestion();
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.userAnswer.trim() && !this.isAnswered) {
      this.checkAnswer();
    }
  }
}
