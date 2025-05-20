import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Status } from './status/status.entity';


interface ReportDescription{
  text : string;
  photoId : string;
}

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  photoId : string

  @Column({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'timestamptz'})
  status_updated_at: Date;

  @Column({ type: 'timestamptz' , nullable : true})
  complited_at: Date;

  @ManyToOne(() => User, (user) => user.reports, { eager: true })
  user: User;

  @ManyToOne(() => Status, (status) => status.reports, { eager: true })
  status: Status;
}
