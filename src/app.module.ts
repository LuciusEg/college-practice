import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StatusModule } from './domains/entity/status/status.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from './bot/bot.module';
import { StateModule } from './core/state/state.module';
import { RouteModule } from './core/route/route.module';
import { RegisterModule } from './domains/register/register.module';
import { ReportsModule } from './domains/report/report.module';
import { TestModule } from './bot/test/test.module';
import { BanMiddleware } from './domains/middleware/ban.middleware';
import { MiddlewareModule } from './domains/middleware/middleware.module';

@Module({
  imports: [
    DatabaseModule,
    StatusModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule, MiddlewareModule],
      inject: [ConfigService, BanMiddleware],
      useFactory: (
        configService: ConfigService,
        banMiddleware: BanMiddleware,
      ) => ({
        token: configService.getOrThrow<string>('BOT_TOKEN'),
        middlewares: [banMiddleware.use],
      }),
    }),
    TestModule,
    BotModule,
    StateModule,
    RouteModule,
    RegisterModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
