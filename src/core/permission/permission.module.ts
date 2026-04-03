import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/domains/entity/user.entity';
import { PermissionInterceptor } from './permission.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [PermissionInterceptor],
  exports: [PermissionInterceptor, TypeOrmModule],
})
export class PermissionModule {}
