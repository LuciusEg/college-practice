import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/domains/entity/user.entity';
import { Status } from 'src/domains/entity/status/status.entity';
import { Report } from 'src/domains/entity/report.entity';
import { BotAction } from './bot.action';
import { StateModule } from 'src/core/state/state.module';
import { Company } from 'src/domains/entity/company.entity';
import { Department } from 'src/domains/entity/department.entity';
import { RouteModule } from 'src/core/route/route.module';
import { RegisterModule } from 'src/domains/register/register.module';
import { ReportsModule } from 'src/domains/report/report.module';
@Module({
    providers : [BotService, BotUpdate, BotAction],
    imports : [TypeOrmModule.forFeature([Report, User, Status, Company, Department]), StateModule, RouteModule, RegisterModule, ReportsModule],
})
export class BotModule {}
