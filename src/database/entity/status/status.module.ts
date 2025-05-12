import { Module } from "@nestjs/common";
import { StatusSeeder } from "./status.seeder";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Status } from "./status.entity";
@Module({
    imports : [TypeOrmModule.forFeature([Status])],
    providers : [StatusSeeder],
})
export class StatusModule{};