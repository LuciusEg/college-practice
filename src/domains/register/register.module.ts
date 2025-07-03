// src/features/register/register.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/domains/entity/user.entity';
import { Company } from 'src/domains/entity/company.entity';
import { Department } from 'src/domains/entity/department.entity';
import { StateModule } from 'src/core/state/state.module';
import { RegisterRouter } from './register.router';
import { RouteModule } from 'src/core/route/route.module';

@Module({
  imports: [
    StateModule,
    TypeOrmModule.forFeature([User, Company, Department]),
    RouteModule
  ],
  providers: [RegisterRouter],
  exports : [RegisterRouter]      // сам router
})
export class RegisterModule {}
