import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Quiz } from '../quiz/quiz.entity';

@Entity()
export class GameResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Quiz, { eager: true, onDelete: 'CASCADE' })
  quiz: Quiz;

  @Column()
  score: number;

  @Column()
  totalPoints: number;

  @Column('simple-json')
  answers: {
    questionId: string;
    selectedIndex: number;
    correct: boolean;
  }[];

  @CreateDateColumn()
  completedAt: Date;
}
