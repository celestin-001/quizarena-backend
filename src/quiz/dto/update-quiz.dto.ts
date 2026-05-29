import { IsString, IsIn, IsOptional } from 'class-validator';

export class UpdateQuizDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsIn(['easy', 'medium', 'hard'])
  @IsOptional()
  difficulty?: string;
}
