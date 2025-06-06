// state.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class State {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 64 })
  telegramId: string;

  @Column({ length: 100 })
  action: string;

  @Column({ type: 'jsonb', default: {} })
  data: Record<string, any>;
}
