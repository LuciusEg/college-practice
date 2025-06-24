import { Module } from '@nestjs/common';
import { UserDefaultGuard } from './default.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entity/user.entity';

@Module({
    providers : [UserDefaultGuard],
    imports : [TypeOrmModule.forFeature([User])]
})
export class ValidationModule {}
