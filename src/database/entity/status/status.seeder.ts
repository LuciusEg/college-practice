import { Injectable, OnModuleInit } from "@nestjs/common";
import { Repository } from "typeorm";
import { Status } from "./status.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { StatusCode } from "./status.enum";

@Injectable()
export class StatusSeeder implements OnModuleInit{
    constructor(
        @InjectRepository(Status)
        private readonly statusRepository : Repository<Status>
    ){}
    async onModuleInit() {
        const existing = await this.statusRepository.find()

        const existingSet = new Set(existing.map(s => s.status))

        //преобразуем enum в массив занчений, проходимся фильтром чтобы отсеять значения которых нет в бд, и с помощью map делаем прапвильную структуру для внесения в бд.
        const toInsert = Object.values(StatusCode)
            .filter(value => !existingSet.has(value))
            .map(value => ({status : value}))

        if(toInsert.length > 0){
            await this.statusRepository.insert(toInsert)
        }
    }
}