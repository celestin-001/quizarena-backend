import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Controller()
export class QuestionController {
  constructor(private questionService: QuestionService) {}

  // GET /quizzes/:quizId/questions
  @Get('quizzes/:quizId/questions')
  findAll(@Param('quizId') quizId: string) {
    return this.questionService.findAll(quizId);
  }

  // POST /quizzes/:quizId/questions
  @Post('quizzes/:quizId/questions')
  @UseGuards(AuthGuard('jwt'))
  create(
    @Param('quizId') quizId: string,
    @Body() dto: CreateQuestionDto,
    @Request() req: { user: any },
  ) {
    return this.questionService.create(quizId, dto, req.user);
  }

  // PUT /questions/:id
  @Put('questions/:id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
    @Request() req: { user: any },
  ) {
    return this.questionService.update(id, dto, req.user);
  }

  // DELETE /questions/:id
  @Delete('questions/:id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string, @Request() req: { user: any }) {
    return this.questionService.remove(id, req.user);
  }
}
