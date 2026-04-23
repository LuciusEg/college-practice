import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { Injectable } from '@nestjs/common';
import { sendUserBanned } from '../response/bot.response';

@Injectable()
export class BanMiddleware {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  use = async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId) {
      await next();
      return;
    }

    const user = await this.userRepository.findOne({
      where: { telegramId: String(userId) },
    });
    if (!user) {
      await sendUserBanned(ctx);
      return;
    }
    if (!user.isActive) {
      await sendUserBanned(ctx);
      return;
    }
    await next();
  };
}
