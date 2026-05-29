import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameResult } from './game.entity';
import { Quiz } from '../quiz/quiz.entity';
import { User } from '../user/user.entity';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  @IsString()
  questionId: string;

  @IsNumber()
  selectedIndex: number;
}

export class SubmitGameDto {
  @IsString()
  quizId: string;

  @IsNumber()
  score: number;

  @IsNumber()
  totalPoints: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameResult)
    private gameRepository: Repository<GameResult>,
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
  ) {}

  async submitResult(dto: SubmitGameDto, user: User) {
    // Charge le vrai objet Quiz depuis la base
    const quiz = await this.quizRepository.findOne({
      where: { id: dto.quizId },
    });
    if (!quiz) throw new NotFoundException('Quiz introuvable');

    const result = this.gameRepository.create({
      user,
      quiz,
      score: dto.score,
      totalPoints: dto.totalPoints,
      answers: dto.answers,
    });
    return this.gameRepository.save(result);
  }

  async getLeaderboard() {
    const results = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.user', 'user')
      .select([
        'user.id AS userId',
        'user.username AS username',
        'SUM(game.score) AS totalScore',
        'COUNT(game.id) AS gamesPlayed',
        'AVG(game.score * 100.0 / game.totalPoints) AS avgPercent',
      ])
      .groupBy('user.id')
      .orderBy('totalScore', 'DESC')
      .limit(20)
      .getRawMany();

    return results.map((r, index) => ({
      rank: index + 1,
      userId: r.userId,
      username: r.username,
      totalScore: parseInt(r.totalScore),
      gamesPlayed: parseInt(r.gamesPlayed),
      avgPercent: Math.round(parseFloat(r.avgPercent)),
    }));
  }

  async getUserStats(userId: string) {
    const results = await this.gameRepository.find({
      where: { user: { id: userId } },
      order: { completedAt: 'DESC' },
      take: 10,
    });

    const totalScore = results.reduce((acc, r) => acc + r.score, 0);
    const avgPercent = results.length
      ? Math.round(
          results.reduce((acc, r) => acc + (r.score / r.totalPoints) * 100, 0) /
            results.length,
        )
      : 0;

    return {
      gamesPlayed: results.length,
      totalScore,
      avgPercent,
      recentGames: results,
    };
  }
}