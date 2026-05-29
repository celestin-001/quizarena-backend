import { IsString, IsIn, IsOptional } from 'class-validator';

export class CreateQuizDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  category: string;

  @IsIn(['easy', 'medium', 'hard'])
  @IsOptional()
  difficulty?: string;
}
