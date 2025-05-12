import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { StatusModule } from './database/entity/status/status.module';
import { RoleModule } from './database/entity/role/role.module';

@Module({
  imports: [
    DatabaseModule,
    StatusModule,
    RoleModule,
    ConfigModule.forRoot({
    isGlobal : true
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
