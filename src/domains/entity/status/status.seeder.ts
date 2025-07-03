import { Injectable, OnModuleInit } from "@nestjs/common";
import { Repository } from "typeorm";
import { Status } from "./status.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { StatusCode } from "./status.enum";
import { In } from 'typeorm';

@Injectable()
export class StatusSeeder implements OnModuleInit{
    constructor(
        @InjectRepository(Status)
        private readonly statusRepository : Repository<Status>
    ){}
    async onModuleInit() {
        const existing = await this.statusRepository.find()

        const existingSet = new Set(existing.map(s => s.name))

        const enumSet = new Set(Object.values(StatusCode))

        const toInsert : string[] = []
        const toDelete : string[] = []

        enumSet.forEach((value) => {
            if(!existingSet.has(value)){
                toInsert.push(value)
            }
        })

        existingSet.forEach((value) => {
            if(!enumSet.has(value as StatusCode)){
                toDelete.push(value)
            }
        })

        await this.statusRepository.delete({
            name : In(toDelete),
        });
        await this.statusRepository.insert(toInsert.map(value => ({name : value})))
    }
}