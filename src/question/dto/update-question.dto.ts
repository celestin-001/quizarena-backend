import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  ArrayMinSize,
} from 'class-validator';

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  correctIndex?: number;

  @IsNumber()
  @IsOptional()
  points?: number;
}
