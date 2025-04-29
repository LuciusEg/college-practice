import { Column, Entity, PrimaryGeneratedColumn, OneToMany} from "typeorm";
import { Report } from "./report.entity";

@Entity()
export class Status{
    @PrimaryGeneratedColumn()
    id : number

    @Column({length : 25})
    status : string

    @OneToMany(() => Report, (report) => report.status)
    reports : Report[]
}