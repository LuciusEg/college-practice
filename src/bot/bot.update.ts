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

  @On('text')
  async onMessage(@Ctx() ctx: Context) {
    this.botService.onMessage(ctx);
  }

  @Action('get_reports')
  async onGetReports(@Ctx() ctx: Context) {
    const reports = await this.botService.getReports();
    
    if (reports.length === 0) {
      await ctx.reply('Отчетов не найдено');
      return;
    }

    for (const report of reports) {
      await ctx.replyWithMarkdown(
        `*Отчет #${report.id}*\n` +
        `📝описание: ${report.description}\n` +
        `🕒создано: ${report.created_at.toLocaleDateString()}\n` +
        `🕒изменено: ${report.status_updated_at.toLocaleDateString()}\n` +
        `🕒выполнено: ${report.complited_at.toLocaleDateString()}\n` +
        `🔄статус: ${report.status.status}`
      );
    }
  }
}