import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Report } from "./report.entity";

@Entity()
export class Support{
    @PrimaryGeneratedColumn()
    id : number

    @Column({length : 100})
    name : string

    @Column()
    telegramId : string

    @OneToMany(() => Report, (report) => report.support)
    reports : Report[]
}