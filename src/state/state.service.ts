// state.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from './entity/state.entity';

@Injectable()
export class StateService {
  constructor(
    @InjectRepository(State)
    private readonly repository: Repository<State>,
  ) {}

  async setState(telegramId: string, action: string, data: Record<string, any> = {}): Promise<void> {
    const existing = await this.repository.findOne({ where: { telegramId } });
    if (existing) {
      existing.action = action;
      existing.data = data;
      await this.repository.save(existing);
    } else {
      const state = this.repository.create({ telegramId, action, data });
      await this.repository.save(state);
    }
  }

  async getState(telegramId: string): Promise<State | null> {
    return await this.repository.findOne({ where: { telegramId } });
  }

  async clearState(telegramId: string): Promise<void> {
    await this.repository.delete({ telegramId });
  }

  async updateData(telegramId: string, data: Record<string, any>): Promise<void> {
    const state = await this.repository.findOne({ where: { telegramId } });
    if (!state) return;
    state.data = { ...state.data, ...data };
    await this.repository.save(state);
  }
}
