import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entity/user.entity';
import { Status } from 'src/database/entity/status/status.entity';
import { Report } from 'src/database/entity/report.entity';
import { BotAction } from './bot.action';
import { StateModule } from 'src/state/state.module';
import { Company } from 'src/database/entity/company.entity';
import { Department } from 'src/database/entity/department.entity';
@Module({
    providers : [BotService, BotUpdate, BotAction],
    imports : [TypeOrmModule.forFeature([Report, User, Status, Company, Department]), StateModule],
})
export class BotModule {}
