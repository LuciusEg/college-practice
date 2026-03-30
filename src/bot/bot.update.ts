import { Update, Action, Ctx, Start, On, Next, Command } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service';
import { sendUnknownCommand } from 'src/domains/response/bot.response';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await this.botService.onStart(ctx);
  }
  @On('message')
  async onMessage(@Ctx() ctx: Context) {
    const isStateProcessed = await this.botService.onMessage(ctx);

    if (!isStateProcessed) {
      await sendUnknownCommand(ctx);
    }
  }
}
