import { Module } from '@nestjs/common';
import { PermissionModule } from 'src/core/permission/permission.module';
import { TestUpdate } from './test.update';
import { StateModule } from 'src/core/state/state.module';
import { BotModule } from '../bot.module';

@Module({
  imports: [PermissionModule, StateModule, BotModule],
  providers: [TestUpdate],
})
export class TestModule {}
