import { OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "./role.entity";
import { In, Repository } from "typeorm";
import { RoleCode } from "./role.enum";

export class RoleSeeder implements OnModuleInit{

    constructor(
        @InjectRepository(Role)
        private readonly roleRepository : Repository<Role>,
    ){}

    async onModuleInit() {
        const existing = await this.roleRepository.find()

                const existingSet = new Set(existing.map(s => s.name))
    
                const enumSet = new Set(Object.values(RoleCode))
        
                const toInsert : string[] = []
                const toDelete : string[] = []
        
                enumSet.forEach((value) => {
                    if(!existingSet.has(value)){
                        toInsert.push(value)
                    }
                })
        
                existingSet.forEach((value) => {
                    if(!enumSet.has(value as RoleCode)){
                        toDelete.push(value)
                    }
                })
        
                await this.roleRepository.delete({
                    name : In(toDelete),
                });
                await this.roleRepository.insert(toInsert.map(value => ({name : value})))
    }
}