import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsUpdate } from './settings.update';
import { SettingsService } from './settings.service';
import { PermissionModule } from 'src/core/permission/permission.module';
import { StateModule } from 'src/core/state/state.module';
import { User } from 'src/domains/entity/user.entity';
import { Company } from 'src/domains/entity/company.entity';
import { Department } from 'src/domains/entity/department.entity';

@Module({
  imports: [
    PermissionModule,
    StateModule,
    TypeOrmModule.forFeature([User, Company, Department]),
  ],
  providers: [SettingsUpdate, SettingsService],
})
export class SettingsModule {}
