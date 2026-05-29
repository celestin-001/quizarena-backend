import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './quiz.entity';
import { Question } from '../question/question.entity';
import { User } from '../user/user.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async findAll(page = 1, search = '', category = '', difficulty = '') {
    const limit = 10;
    const query = this.quizRepository
      .createQueryBuilder('quiz')
      .leftJoinAndSelect('quiz.author', 'author');

    if (search) {
      query.andWhere('quiz.title LIKE :search', { search: `%${search}%` });
    }
    if (category) {
      query.andWhere('quiz.category = :category', { category });
    }
    if (difficulty) {
      query.andWhere('quiz.difficulty = :difficulty', { difficulty });
    }

    const total = await query.getCount();
    const quizzes = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // Ajoute le nombre de questions pour chaque quiz
    const data = await Promise.all(
      quizzes.map(async (quiz) => {
        const questionsCount = await this.questionRepository.count({
          where: { quiz: { id: quiz.id } },
        });
        return { ...quiz, questionsCount };
      }),
    );

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!quiz) throw new NotFoundException('Quiz introuvable');

    const questions = await this.questionRepository.find({
      where: { quiz: { id } },
    });

    return { ...quiz, questions };
  }

  async create(dto: CreateQuizDto, author: User) {
    const quiz = this.quizRepository.create({ ...dto, author });
    return this.quizRepository.save(quiz);
  }

  async update(id: string, dto: UpdateQuizDto, user: User) {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!quiz) throw new NotFoundException('Quiz introuvable');
    if (quiz.author.id !== user.id)
      throw new ForbiddenException('Non autorisé');

    Object.assign(quiz, dto);
    return this.quizRepository.save(quiz);
  }

  async remove(id: string, user: User) {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!quiz) throw new NotFoundException('Quiz introuvable');
    if (quiz.author.id !== user.id)
      throw new ForbiddenException('Non autorisé');

    await this.quizRepository.remove(quiz);
    return { message: 'Quiz supprimé avec succès' };
  }
}
