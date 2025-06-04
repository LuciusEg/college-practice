import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Report } from './report.entity';
import { Role } from './role/role.entity';
import { Company } from './company.entity';
import { Department } from './department.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64 })
  telegramId: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  middleName: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  @OneToMany(() => Role, (role) => role.user)
  roles: Role[];
}
