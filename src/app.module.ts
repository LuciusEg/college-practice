import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { StatusSeeder } from './database/entity/status/status.seeder';
import { StatusModule } from './database/entity/status/status.module';

@Module({
  imports: [
    DatabaseModule,
    StatusModule,
    ConfigModule.forRoot({
    isGlobal : true
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
