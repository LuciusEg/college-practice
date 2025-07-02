import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Report } from 'src/domains/entity/report.entity';
import { Status } from 'src/domains/entity/status/status.entity';
import { User } from 'src/domains/entity/user.entity';

import { StateModule } from 'src/core/state/state.module';
import { RouteModule } from 'src/core/route/route.module';
import { ReportsRouter } from './report.router';

@Module({
  imports: [
    StateModule,
    RouteModule,
    TypeOrmModule.forFeature([Report, Status, User]),
  ],
  providers: [ReportsRouter],
  exports : [ReportsRouter]
})
export class ReportsModule {}
