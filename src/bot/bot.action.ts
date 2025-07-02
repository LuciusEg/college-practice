import { Context } from 'telegraf';
import { BotService } from './bot.service';
import { Action, Ctx, Update } from 'nestjs-telegraf';
import { RegisterRouter } from 'src/domains/register/register.router';
import { ReportsRouter } from 'src/domains/report/report.router';

@Update()
export class BotAction {
  constructor(
    private readonly registerRouter : RegisterRouter,
    private readonly reportRouter : ReportsRouter,
  ) {}

  @Action('/create_report')
  async onCreate(@Ctx() ctx: Context) {
    await ctx.editMessageReplyMarkup(undefined);
    ctx.answerCbQuery();
    this.reportRouter.createQuestion(ctx);
  }
  @Action(/select_company_(\d+)/)
  async onSelectCompany(@Ctx() ctx: Context & { match: RegExpMatchArray }) {
    ctx.answerCbQuery();
    await ctx.deleteMessage();
    this.registerRouter.company(ctx);
  }
  @Action(/select_department_(\d+)/)
  async onSelectDepartment(@Ctx() ctx: Context & { match: RegExpMatchArray }) {
    ctx.answerCbQuery();
    await ctx.deleteMessage();
    this.registerRouter.department(ctx);
  }

  @Action("/get_reports")
  async onGetReports(@Ctx() ctx: Context) {
    ctx.answerCbQuery();
    await ctx.deleteMessage();
    await this.reportRouter.OnGetReports(ctx);
  }
}
