import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TriviaService } from './trivia.service';
import { IsString, IsNumber, IsIn, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class ImportTriviaDto {
  @IsString()
  title: string;

  @IsNumber()
  @IsOptional()
  @Min(5)
  @Max(20)
  @Type(() => Number)
  amount?: number;

  @IsIn(['easy', 'medium', 'hard'])
  @IsOptional()
  difficulty?: 'easy' | 'medium' | 'hard';

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  categoryId?: number;
}

@Controller('trivia')
export class TriviaController {
  constructor(private triviaService: TriviaService) {}

  // GET /trivia/categories
  @Get('categories')
  getCategories() {
    return this.triviaService.getCategories();
  }

  // POST /trivia/import
  @Post('import')
  @UseGuards(AuthGuard('jwt'))
  import(
    @Body() dto: ImportTriviaDto,
    @Request() req: { user: any },
  ) {
    return this.triviaService.importFromTrivia(dto, req.user);
  }
}