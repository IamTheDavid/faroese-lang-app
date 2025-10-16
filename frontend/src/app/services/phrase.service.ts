import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface QuizQuestion {
    en: string;
    fo: string;
    options: string[];
}

interface WordGameQuestion {
    en: string;
    foWords: string[];
    shuffledWords: string[];
}

interface TranslationGameQuestion {
    en: string;
    correctAnswer: string;
    hints: string[];
}

@Injectable({
    providedIn: 'root',
})
export class PhraseService {
    constructor(private http: HttpClient) { }

    getApiUrl(): string {
        return environment.API_URL + '/quiz';
    }

    getQuestion(): Observable<QuizQuestion> {
        return this.http.get<QuizQuestion>(`${this.getApiUrl()}/question`);
    }

    getWordGameQuestion(): Observable<WordGameQuestion> {
        return this.http.get<WordGameQuestion>(`${this.getApiUrl()}/word-game`);
    }

    getTranslationGameQuestion(): Observable<TranslationGameQuestion> {
        return this.http.get<TranslationGameQuestion>(`${this.getApiUrl()}/translation-game`);
    }
}
