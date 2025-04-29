import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Support } from "./support.entity";
import { Status } from "./status.entity";


@Entity()
export class Report{
    @PrimaryGeneratedColumn()
    id : number

    @Column()
    description : string

    @Column({type : Date})
    created_at : Date

    @Column({type : Date})
    status_updated_at : Date

    @Column({type : Date})
    complited_at : Date
    
    @ManyToOne(() => User, (user) => user.reports, {eager : true})
    user : User

    @ManyToOne(() => Support, (support) => support.reports, {eager : true})
    support : Support

    @ManyToOne(() => Status, (status) => status.reports, {eager : true})
    status : Status
}