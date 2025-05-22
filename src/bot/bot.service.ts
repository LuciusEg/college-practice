import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from 'src/database/entity/report.entity';
import { Markup } from 'telegraf';

@Injectable()
export class BotService {
  constructor(
    @InjectRepository(Report)
    private reportRepo: Repository<Report>,
  ) {}

  async getReports() {
    return this.reportRepo.find({ 
      order: { created_at: 'DESC' },
      take: 10 
    });
  }

  onStart(ctx: any) {
    ctx.reply(
      '📊 Для просмотра отчетов нажмите кнопку',
      Markup.inlineKeyboard([
        [Markup.button.callback('Показать отчеты', 'get_reports')]
      ])
    );
  }

  // Обработка текстовых сообщений (заглушка)
  onMessage(ctx: any) {
    ctx.reply('Используйте кнопки для навигации');
  }
}