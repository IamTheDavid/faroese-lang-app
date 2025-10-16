import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { PhraseService } from '../../services/phrase.service';
import { AuthService } from '../../services/auth.service';
import { ScoreService } from '../../services/score.service';
import { LoadingComponent } from '../../components/loading/loading.component';

interface WordEntry {
  word: string;
  used: boolean;
}

@Component({
  standalone: true,
  selector: 'app-word-game',
  templateUrl: './word-game.component.html',
  imports: [CommonModule, IonicModule, LoadingComponent],
})
export class WordGameComponent implements OnInit {
  private readonly phraseService = inject(PhraseService);
  private readonly authService = inject(AuthService);
  private readonly scoreService = inject(ScoreService);
  private readonly cdr = inject(ChangeDetectorRef);
  
  wordOptions: WordEntry[] = [];
  selectedWords: string[] = [];
  targetSentence: string[] = [];
  enSentence: string = '';
  isLoading: boolean = true;
  feedback: string = '';
  questionCount: number = 0;
  correctCount: number = 0;
  maxQuestions: number = 10;
  quizComplete: boolean = false;
  wrongAnswer: boolean = false;

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
    this.wrongAnswer = false;
    this.selectedWords = [];

    this.phraseService.getWordGameQuestion().subscribe({
      next: (data) => {
        this.wordOptions = data.shuffledWords.map(w => ({ word: w, used: false }));
        this.targetSentence = data.foWords;
        this.enSentence = data.en;
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
          gameType: 'word-game',
          score: this.correctCount,
          totalQuestions: this.maxQuestions
        });
      } catch (error) {
        console.error('Error submitting score:', error);
      }
    }
  }

  selectWord(word: string) {
    const entry = this.wordOptions.find(w => w.word === word);
    if (entry && !entry.used) {
      entry.used = true;
      this.selectedWords.push(word);
    }
  }

  checkAnswer() {
    const isCorrect = this.selectedWords.join(' ') === this.targetSentence.join(' ');
    this.feedback = isCorrect ? 'Correct!' : `Wrong! Correct: ${this.targetSentence.join(' ')}`;
    this.wrongAnswer = !isCorrect;

    if (isCorrect) {
      this.correctCount++;
    }

    setTimeout(() => this.loadNewQuestion(), isCorrect ? 700 : 2500);
  }

  unselectWord(word: string) {
    const entry = this.wordOptions.find(w => w.word === word);
    if (entry) {
      entry.used = false;
      this.selectedWords = this.selectedWords.filter(w => w !== word);
    }
  }

  restartGame() {
    this.correctCount = 0;
    this.questionCount = 0;
    this.quizComplete = false;
    this.loadNewQuestion();
  }
}
