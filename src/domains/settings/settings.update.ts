import { Action, Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { SettingsService } from './settings.service';
import { UseInterceptors } from '@nestjs/common';
import { PermissionInterceptor } from 'src/core/permission/permission.interceptor';
import { Permission } from 'src/core/permission/permission.decorator';
import { RoleCode } from 'src/domains/entity/role/role.enum';
import { StateService } from 'src/core/state/state.service';
import { StateRoute } from 'src/core/route/state-route.decorator';

@Update()
export class SettingsUpdate {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly stateService: StateService,
  ) {}

  @UseInterceptors(PermissionInterceptor)
  @Permission(RoleCode.User)
  @Command('settings')
  async showSettings(@Ctx() ctx: Context) {
    await this.settingsService.showSettings(ctx);
  }

  // --- Фамилия ---
  @Action('edit_lastname')
  async editLastname(@Ctx() ctx: Context) {
    ctx.answerCbQuery();
    await ctx.deleteMessage().catch(() => {});
    await ctx.reply('Введите новую фамилию:', {
      reply_markup: {
        inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'settings_cancel' }]],
      },
    });
    await this.stateService.setState(String(ctx.from!.id), 'edit_lastname');
  }

  @StateRoute('edit_lastname')
  async editLastnameState(@Ctx() ctx: Context) {
    await this.settingsService.editLastname(ctx);
  }

  // --- Имя ---
  @Action('edit_firstname')
  async editFirstname(@Ctx() ctx: Context) {
    ctx.answerCbQuery();
    await ctx.deleteMessage().catch(() => {});
    await ctx.reply('Введите новое имя:', {
      reply_markup: {
        inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'settings_cancel' }]],
      },
    });
    await this.stateService.setState(String(ctx.from!.id), 'edit_firstname');
  }

  @StateRoute('edit_firstname')
  async editFirstnameState(@Ctx() ctx: Context) {
    await this.settingsService.editFirstname(ctx);
  }

  // --- Отчество ---
  @Action('edit_middlename')
  async editMiddlename(@Ctx() ctx: Context) {
    ctx.answerCbQuery();
    await ctx.deleteMessage().catch(() => {});
    await ctx.reply('Введите новое отчество:', {
      reply_markup: {
        inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'settings_cancel' }]],
      },
    });
    await this.stateService.setState(String(ctx.from!.id), 'edit_middlename');
  }

  @StateRoute('edit_middlename')
  async editMiddlenameState(@Ctx() ctx: Context) {
    await this.settingsService.editMiddlename(ctx);
  }

  // --- Подразделение (через кнопки: компания → подразделение) ---
  @Action('edit_department')
  async editDepartment(@Ctx() ctx: Context) {
    ctx.answerCbQuery();
    await ctx.deleteMessage().catch(() => {});
    await this.settingsService.showCompanies(ctx);
  }

  @Action(/^settings_company_(\d+)$/)
  async onSelectCompany(@Ctx() ctx: Context & { match: RegExpMatchArray }) {
    ctx.answerCbQuery();
    await ctx.deleteMessage().catch(() => {});
    const companyId = Number(ctx.match[1]);
    await this.settingsService.showDepartments(ctx, companyId);
  }

  @Action(/^settings_dept_(\d+)$/)
  async onSelectDept(@Ctx() ctx: Context & { match: RegExpMatchArray }) {
    ctx.answerCbQuery();
    await ctx.deleteMessage().catch(() => {});
    const deptId = Number(ctx.match[1]);
    await this.settingsService.saveDepartment(ctx, deptId);
  }

  // --- Отмена ---
  @Action('settings_cancel')
  async onCancel(@Ctx() ctx: Context) {
    ctx.answerCbQuery();
    await ctx.deleteMessage().catch(() => {});
    await this.stateService.clearState(String(ctx.from!.id));
    await this.settingsService.refreshAndShow(ctx);
  }

  // --- Назад ---
  @Action('back_to_menu')
  async onBackToMenu(@Ctx() ctx: Context) {
    ctx.answerCbQuery();
    await ctx.deleteMessage().catch(() => {});
    await this.stateService.clearState(String(ctx.from!.id));
    await ctx.reply('🏠 Главное меню', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Создать отчет', callback_data: '/create_report' },
            { text: 'Все отчеты', callback_data: '/get_reports' },
          ],
        ],
      },
    });
  }
}
