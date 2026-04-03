import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { BaseRouter } from './state-routing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/domains/entity/user.entity';

@Module({
  imports: [DiscoveryModule, TypeOrmModule.forFeature([User])],
  providers: [BaseRouter],
  exports: [BaseRouter],
})
export class RouteModule {}
