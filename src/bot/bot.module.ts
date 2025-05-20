import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entity/user.entity';
import { Status } from 'src/database/entity/status/status.entity';
import { Report } from 'src/database/entity/report.entity';
@Module({
    providers : [BotService, BotUpdate],
    imports : [TypeOrmModule.forFeature([Report, User, Status])],
})
export class BotModule {}
