import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StatusModule } from './database/entity/status/status.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from './bot/bot.module';


@Module({
  imports: [
    DatabaseModule,
    StatusModule,
    ConfigModule.forRoot({
      isGlobal : true
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.getOrThrow<string>('BOT_TOKEN'),
      }),
    }),
    BotModule,
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
