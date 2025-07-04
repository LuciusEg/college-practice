import { Update, Action, Ctx, Start, On } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    this.botService.onStart(ctx);
  }

  @On('message')
  onMessage(@Ctx() ctx : Context) {
    this.botService.onMessage(ctx)
  }
}