import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "./role.entity";
import { RoleSeeder } from "./role.seeder";

@Module({
    imports : [TypeOrmModule.forFeature([Role])],
    providers : [RoleSeeder],
})
export class RoleModule{};