import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Department } from './department.entity';
import { User } from './user.entity';

@Entity({ name: 'company' })
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @OneToMany(() => Department, (department) => department.company)
  departments: Department[];

  @OneToMany(() => User, (user) => user.company)
  users: User[];
}
