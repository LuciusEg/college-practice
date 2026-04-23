import { Module } from '@nestjs/common';
import { BanMiddleware } from './ban.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';

@Module({
  providers: [BanMiddleware],
  exports: [BanMiddleware],
  imports: [TypeOrmModule.forFeature([User])],
})
export class MiddlewareModule {}
