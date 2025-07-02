import { Context } from 'telegraf';
import { BotService } from './bot.service';
import { Action, Ctx, Update } from 'nestjs-telegraf';

@Update()
export class BotAction {
  constructor(private readonly botService: BotService) {}

  @Action('create_report')
  async onCreate(@Ctx() ctx: Context) {
    await ctx.editMessageReplyMarkup(undefined);
    ctx.answerCbQuery();
    this.botService.createQuestion(ctx);
  }
  @Action(/select_company_(\d+)/)
  async onSelectCompany(@Ctx() ctx: Context & { match: RegExpMatchArray }) {
    ctx.answerCbQuery();
    await ctx.deleteMessage();
    const id = Number(ctx.match[1]);
    this.botService.company(ctx, id);
  }
  @Action(/select_department_(\d+)/)
  async onSelectDepartment(@Ctx() ctx: Context & { match: RegExpMatchArray }) {
    ctx.answerCbQuery();
    await ctx.deleteMessage();
    const id = Number(ctx.match[1]);
    this.botService.department(ctx, id);
  }
}
