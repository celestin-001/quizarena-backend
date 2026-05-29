import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  ArrayMinSize,
} from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  text: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options: string[];

  @IsNumber()
  @Min(0)
  correctIndex: number;

  @IsNumber()
  @IsOptional()
  points?: number;
}
