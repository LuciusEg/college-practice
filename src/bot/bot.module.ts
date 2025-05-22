import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from 'src/database/entity/report.entity';

@Module({

    imports: [
    TypeOrmModule.forFeature([Report]), // Регистрируем репозиторий
  ],
    providers : [BotService, BotUpdate],
})
export class BotModule {}
