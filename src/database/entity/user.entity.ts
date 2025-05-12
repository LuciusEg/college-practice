import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Report } from "./report.entity";
import { Role } from "./role.entity"

@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id : number

    @Column({length : 100})
    name : string

    @Column()
    telegramId : string

    @OneToMany(() => Report, (report) => report.user)
    reports : Report[]

    @OneToMany(() => Role, (role) => role.user)
    roles : Role[]

}