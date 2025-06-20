import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from 'src/database/entity/report.entity';
import { Context, Markup } from 'telegraf';

@Injectable()
export class BotService {
  constructor(
    @InjectRepository(Report)
    private reportRepo: Repository<Report>,
  ) {}


  onStart(ctx: Context) {
    ctx.reply(
      '📊 Для просмотра отчетов нажмите кнопку',
      Markup.inlineKeyboard([
        [Markup.button.callback('Показать отчеты', 'get_reports')]
      ])
    );
  }

  async OnGetReports(ctx: Context) {
    const reports = await this.reportRepo.find();
    
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

  // Обработка текстовых сообщений (заглушка)
  onMessage(ctx: Context) {
    ctx.reply('Используйте кнопки для навигации');
  }
}