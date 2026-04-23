import { Module } from '@nestjs/common';
import { BanMiddleware } from './ban.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';

import { StateModule } from '../../core/state/state.module';

@Module({
  providers: [BanMiddleware],
  exports: [BanMiddleware],
  imports: [TypeOrmModule.forFeature([User]), StateModule],
})
export class MiddlewareModule {}
