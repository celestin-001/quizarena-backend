import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Quiz } from '../quiz/quiz.entity';
import { Question } from '../question/question.entity';
import { User } from '../user/user.entity';

interface TriviaQuestion {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  difficulty: string;
  category: string;
}

interface TriviaResponse {
  response_code: number;
  results: TriviaQuestion[];
}

interface TriviaCategoryResponse {
  trivia_categories: { id: number; name: string }[];
}

interface ImportTriviaDto {
  title: string;
  amount?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  categoryId?: number;
}

const CATEGORY_LABELS: Record<number, string> = {
  9:  'Culture générale',
  10: 'Livres',
  11: 'Films',
  12: 'Musique',
  13: 'Comédies musicales',
  14: 'Télévision',
  15: 'Jeux vidéo',
  16: 'Jeux de société',
  17: 'Sciences & Nature',
  18: 'Informatique',
  19: 'Mathématiques',
  20: 'Mythologie',
  21: 'Sport',
  22: 'Géographie',
  23: 'Histoire',
  24: 'Politique',
  25: 'Art',
  26: 'Célébrités',
  27: 'Animaux',
  28: 'Véhicules',
  29: 'Bandes dessinées',
  30: 'Gadgets',
  31: 'Anime & Manga',
  32: 'Dessins animés',
};

// URL publique LibreTranslate
const LIBRETRANSLATE_URL = 'https://libretranslate.com/translate';

@Injectable()
export class TriviaService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  // ── Traduction via LibreTranslate ─────────────────────
  private async translateText(text: string): Promise<string> {
    try {
      const { data } = await axios.get(
        'https://api.mymemory.translated.net/get',
        {
          params: {
            q: text,
            langpair: 'en|fr',
          },
          timeout: 5000,
        },
      );
      return data.responseData.translatedText ?? text;
    } catch {
      return text;
    }
  }

  // Traduit plusieurs textes en parallèle
  private async translateMany(texts: string[]): Promise<string[]> {
    return Promise.all(texts.map((t) => this.translateText(t)));
  }

  // ── Catégories ────────────────────────────────────────
  async getCategories() {
    const { data } = await axios.get<TriviaCategoryResponse>(
      'https://opentdb.com/api_category.php',
    );
    return data.trivia_categories.map((cat) => ({
      id: cat.id,
      name: CATEGORY_LABELS[cat.id] ?? cat.name,
    }));
  }

  // ── Import principal ──────────────────────────────────
  async importFromTrivia(dto: ImportTriviaDto, author: User) {
    const { title, amount = 10, difficulty = 'easy', categoryId } = dto;

    // 1. Récupère les questions depuis Open Trivia DB
    const params: Record<string, string | number> = {
      amount,
      difficulty,
      type: 'multiple',
    };
    if (categoryId) params.category = categoryId;

    const { data } = await axios.get<TriviaResponse>(
      'https://opentdb.com/api.php',
      { params },
    );

    if (data.response_code !== 0 || data.results.length === 0) {
      throw new BadRequestException(
        'Impossible de récupérer les questions depuis Open Trivia DB.',
      );
    }

    // 2. Prépare tous les textes à traduire
    const rawQuestions = data.results.map((q) => ({
      ...q,
      question: this.decodeHtml(q.question),
      correct_answer: this.decodeHtml(q.correct_answer),
      incorrect_answers: q.incorrect_answers.map((a) => this.decodeHtml(a)),
    }));

    // 3. Collecte tous les textes en un seul tableau
    //    pour limiter le nombre de requêtes
    const allTexts: string[] = [];
    rawQuestions.forEach((q) => {
      allTexts.push(q.question);
      allTexts.push(q.correct_answer);
      q.incorrect_answers.forEach((a) => allTexts.push(a));
    });

    // 4. Traduit tout en parallèle
    console.log(`🌍 Traduction de ${allTexts.length} textes en cours...`);
    const translated = await this.translateMany(allTexts);

    // 5. Réassemble les textes traduits par question
    let cursor = 0;
    const translatedQuestions = rawQuestions.map((q) => {
      const translatedQuestion = translated[cursor++];
      const translatedCorrect = translated[cursor++];
      const translatedIncorrect = q.incorrect_answers.map(
        () => translated[cursor++],
      );

      const options = [...translatedIncorrect, translatedCorrect];
      const shuffled = options.sort(() => Math.random() - 0.5);
      const correctIndex = shuffled.indexOf(translatedCorrect);

      return {
        text: translatedQuestion,
        options: shuffled,
        correctIndex,
        points: difficulty === 'hard' ? 20 : difficulty === 'medium' ? 15 : 10,
      };
    });

    // 6. Crée le quiz en base
    const categoryLabel = categoryId
      ? (CATEGORY_LABELS[categoryId] ?? 'Culture générale')
      : 'Culture générale';

    const quiz = this.quizRepository.create({
      title,
      description: `Quiz importé et traduit automatiquement — ${categoryLabel}`,
      category: categoryLabel,
      difficulty,
      author,
    });
    await this.quizRepository.save(quiz);

    // 7. Crée les questions traduites en base
    const questions = translatedQuestions.map((q) =>
      this.questionRepository.create({ ...q, quiz }),
    );
    await this.questionRepository.save(questions);

    console.log(
      `Quiz "${title}" créé avec ${questions.length} questions traduites`,
    );

    return {
      ...quiz,
      questionsCount: questions.length,
      message: `${questions.length} questions importées et traduites en français !`,
    };
  }

  // ── Utilitaire ────────────────────────────────────────
  private decodeHtml(text: string): string {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&eacute;/g, 'é')
      .replace(/&egrave;/g, 'è')
      .replace(/&agrave;/g, 'à')
      .replace(/&rsquo;/g, "'")
      .replace(/&laquo;/g, '«')
      .replace(/&raquo;/g, '»');
  }
}