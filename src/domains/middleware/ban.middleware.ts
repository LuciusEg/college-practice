import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { Injectable } from '@nestjs/common';
import { sendUserBanned } from '../response/bot.response';
import { sendNotAuthorized } from '../response/auth.response';
import { StateService } from '../../core/state/state.service';

@Injectable()
export class BanMiddleware {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly stateService: StateService,
  ) {}

  use = async (ctx, next) => {
    if (ctx.message && 'text' in ctx.message && ctx.message.text.startsWith('/start')) {
      await next();
      return;
    }

    const userId = ctx.from?.id;
    if (!userId) {
      await next();
      return;
    }

    const user = await this.userRepository.findOne({
      where: { telegramId: String(userId) },
    });
    if (!user) {
      const state = await this.stateService.getState(String(userId));
      if (state) {
        await next();
        return;
      }

      await sendNotAuthorized(ctx);
      return;
    }
    if (!user.isActive) {
      await sendUserBanned(ctx);
      return;
    }
    await next();
  };
}
