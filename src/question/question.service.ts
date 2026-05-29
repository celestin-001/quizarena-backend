import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './question.entity';
import { Quiz } from '../quiz/quiz.entity';
import { User } from '../user/user.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
  ) {}

  async findAll(quizId: string) {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
    });
    if (!quiz) throw new NotFoundException('Quiz introuvable');

    return this.questionRepository.find({
      where: { quiz: { id: quizId } },
    });
  }

  async create(quizId: string, dto: CreateQuestionDto, user: User) {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
      relations: ['author'],
    });
    if (!quiz) throw new NotFoundException('Quiz introuvable');
    if (quiz.author.id !== user.id) {
      throw new ForbiddenException('Non autorisé');
    }

    const question = this.questionRepository.create({
      ...dto,
      points: dto.points ?? 10,
      quiz,
    });
    return this.questionRepository.save(question);
  }

  async update(id: string, dto: UpdateQuestionDto, user: User) {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['quiz', 'quiz.author'],
    });
    if (!question) throw new NotFoundException('Question introuvable');
    if (question.quiz.author.id !== user.id) {
      throw new ForbiddenException('Non autorisé');
    }

    Object.assign(question, dto);
    return this.questionRepository.save(question);
  }

  async remove(id: string, user: User) {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['quiz', 'quiz.author'],
    });
    if (!question) throw new NotFoundException('Question introuvable');
    if (question.quiz.author.id !== user.id) {
      throw new ForbiddenException('Non autorisé');
    }

    await this.questionRepository.remove(question);
    return { message: 'Question supprimée avec succès' };
  }
}
