import { Module } from '@nestjs/common';
import { StateService } from './state.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { State } from './entity/state.entity';

@Module({
  providers: [StateService],
  exports : [StateService],
  imports : [TypeOrmModule.forFeature([State])]
})
export class StateModule {}
