import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Quiz } from '../quiz/quiz.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @Column('simple-json')
  options: string[];

  @Column()
  correctIndex: number;

  @Column({ default: 10 })
  points: number;

  @ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
  quiz: Quiz;
}
