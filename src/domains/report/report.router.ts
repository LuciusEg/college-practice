import { Injectable } from '@nestjs/common';
import { Context, Markup } from 'telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Report } from 'src/domains/entity/report.entity';
import { Status } from 'src/domains/entity/status/status.entity';
import { User } from 'src/domains/entity/user.entity';

import { StateService } from 'src/core/state/state.service';
import { BaseRouter } from 'src/core/route/state-routing';
import { ReportState } from 'src/domains/report/report.enum';
import { StatusCode } from 'src/domains/entity/status/status.enum';
import { Message } from '@telegraf/types/message';

@Injectable()
export class ReportsRouter {
  constructor(
    private readonly stateService: StateService,
    private readonly router: BaseRouter,

    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
    @InjectRepository(Status)
    private readonly statusRepo: Repository<Status>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    // маршруты
    router.register(ReportState.create_report, this.createReport.bind(this));
  }

  /**
   * Шаг «Опишите проблему»: бот уже поставил человеку состояние
   * ReportState.create_report (например методом createQuestion).
   * Принимаем текст/фото, создаём Report, сбрасываем state.
   */
    async createReport(ctx: Context) {
        const tgId = ctx.from?.id;
        if (!tgId) return;

        const user = await this.userRepo.findOne({
            where: { telegramId: String(tgId) },
        });
        if (!user) {
            await ctx.reply('Сначала зарегистрируйтесь.');
            return;
        }

        // --- собираем текст и фото ---
        const text = ctx?.text ?? '';
        const photoArr = (ctx.message as Message.PhotoMessage)?.photo;
        const photoId =
            photoArr && photoArr.length > 0
            ? photoArr[photoArr.length - 1].file_id
            : '';

        // --- статус «Новый репорт» ---
        const status = await this.statusRepo.findOne({
            where: { name: StatusCode.NewReport },
        });
        if (!status) {
            await ctx.reply('Ошибка: статус NewReport не найден.');
            return;
        }
        // --- создаём и сохраняем репорт ---
        const report = this.reportRepo.create({
            user,
            status,
            text,
            photoId,
            created_at: new Date(),
            status_updated_at: new Date(),
        });
        await this.reportRepo.save(report);

        await ctx.reply('📝 Репорт создан, спасибо!')
        await this.stateService.clearState(String(tgId));
    }

    async createQuestion(ctx : Context) {
        const id = ctx.from?.id
        if(!id) return;
            
        await ctx.reply("Опишите свою проблему")
        this.stateService.setState(String(id), ReportState.create_report)
    }

  /**
   * Вывод всех репортов конкретного пользователя или всех — в зависимости
   * от логики (здесь примитивный пример «все что есть»).
   */
    async listReports(ctx: Context) {
        const reports = await this.reportRepo.find({
            relations: ['status'],
            order: { created_at: 'DESC' },
        });

        if (!reports.length) {
            await ctx.reply('🗒️ Репорты отсутствуют.');
            return;
        }

        for (const r of reports) {
            await ctx.replyWithMarkdown(
            `*Репорт #${r.id}*\n` +
                `👤 Пользователь: ${r.user?.firstName ?? '—'}\n` +
                `📅 Создан: ${r.created_at.toLocaleDateString()}\n` +
                `🔄 Статус: ${r.status.name}\n` +
                (r.text ? `\n${r.text}` : ''),
            );

            if (r.photoId) {
            await ctx.replyWithPhoto(r.photoId);
            }
        }
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
                `🕒создано: ${report.created_at.toLocaleDateString()}\n` +
                `🕒изменено: ${report.status_updated_at.toLocaleDateString()}\n` +
                `🔄статус: ${report.status.name}`
            );
        }
    }
}
