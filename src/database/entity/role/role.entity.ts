import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 35 })
  name: string;

  @ManyToOne(() => User, (user) => user.roles, { eager: true })
  user: User;
}
