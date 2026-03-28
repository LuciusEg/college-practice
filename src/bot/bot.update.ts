import { Update, Action, Ctx, Start, On, Next } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await this.botService.onStart(ctx);
  }
  @On('message')
  async onMessage(@Ctx() ctx: Context, @Next() next: () => Promise<void>) {
    await this.botService.onMessage(ctx);
    await next();
  }
}
