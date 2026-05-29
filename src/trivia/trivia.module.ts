import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TriviaController } from './trivia.controller';
import { TriviaService } from './trivia.service';
import { Quiz } from '../quiz/quiz.entity';
import { Question } from '../question/question.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question]), AuthModule],
  controllers: [TriviaController],
  providers: [TriviaService],
})
export class TriviaModule {}
