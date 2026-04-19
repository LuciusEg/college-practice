import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { User } from '../entity/user.entity';
import { Company } from '../entity/company.entity';
import { Department } from '../entity/department.entity';
import { StateService } from 'src/core/state/state.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SettingsService {
  constructor(
    private readonly stateService: StateService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
  ) {}

  private capitalize(value: string): string {
    const s = value.trim().toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  async refreshAndShow(ctx: Context): Promise<void> {
    const telegramId = String(ctx.from!.id);
    const updated = await this.userRepository.findOne({
      where: { telegramId },
      relations: ['company', 'department'],
    });
    if (updated) ctx.state.user = updated;
    await this.showSettings(ctx);
  }

  async showSettings(ctx: Context) {
    const user = ctx.state.user as User;
    const menu = `⚙️ <b>Настройки аккаунта</b>

<b>Имя:</b> ${user.firstName || 'Не указано'}
<b>Фамилия:</b> ${user.lastName || 'Не указано'}
<b>Отчество:</b> ${user.middleName || 'Не указано'}
<b>Предприятие:</b> ${user.company?.name || 'Не указано'}
<b>Подразделение:</b> ${user.department?.name || 'Не указано'}`;

    await ctx.replyWithHTML(menu, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✏️ Фамилия', callback_data: 'edit_lastname' },
            { text: '✏️ Имя', callback_data: 'edit_firstname' },
          ],
          [
            { text: '✏️ Отчество', callback_data: 'edit_middlename' },
            { text: '✏️ Подразделение', callback_data: 'edit_department' },
          ],
          [{ text: '◀️ Назад', callback_data: 'back_to_menu' }],
        ],
      },
    });
  }


  async updateUserStringField(ctx: Context, field: keyof User, successMessage: string) {
    const telegramId = String(ctx.from!.id);
    const value = ctx.text;
    if (!value) return;

    const formatted = this.capitalize(value);
    
    await this.userRepository.update(
      { telegramId },
      { [field]: formatted },
    );

    await ctx.reply(`✅ ${successMessage}: ${formatted}`);
    await this.stateService.clearState(telegramId);
    await this.refreshAndShow(ctx);
  }

  // --- Фамилия ---
  async editLastname(ctx: Context) {
    return this.updateUserStringField(ctx, 'lastName', 'Фамилия изменена на');
  }

  // --- Имя ---
  async editFirstname(ctx: Context) {
    return this.updateUserStringField(ctx, 'firstName', 'Имя изменено на');
  }

  // --- Отчество ---
  async editMiddlename(ctx: Context) {
    return this.updateUserStringField(ctx, 'middleName', 'Отчество изменено на');
  }

  // --- Подразделение: шаг 1 — показать список компаний ---
  async showCompanies(ctx: Context) {
    const companies = await this.companyRepo.find();
    if (!companies.length) {
      await ctx.reply('Компании не найдены.');
      return;
    }

    await ctx.reply('Выберите предприятие:', {
      reply_markup: {
        inline_keyboard: [
          ...companies.map((c) => [
            { text: c.name, callback_data: `settings_company_${c.id}` },
          ]),
          [{ text: '❌ Отмена', callback_data: 'settings_cancel' }],
        ],
      },
    });
  }

  // --- Подразделение: шаг 2 — показать подразделения для выбранной компании ---
  async showDepartments(ctx: Context, companyId: number) {
    const depts = await this.deptRepo.find({
      where: { company: { id: companyId } },
    });

    if (!depts.length) {
      await ctx.reply('В этой компании нет подразделений.');
      return;
    }

    await ctx.reply('Выберите подразделение:', {
      reply_markup: {
        inline_keyboard: [
          ...depts.map((d) => [
            { text: d.name, callback_data: `settings_dept_${d.id}` },
          ]),
          [{ text: '❌ Отмена', callback_data: 'settings_cancel' }],
        ],
      },
    });
  }

  // --- Подразделение: шаг 3 — сохранить ---
  async saveDepartment(ctx: Context, deptId: number) {
    const telegramId = String(ctx.from!.id);

    const dept = await this.deptRepo.findOne({
      where: { id: deptId },
      relations: ['company'],
    });

    if (!dept) {
      await ctx.reply('Подразделение не найдено.');
      return;
    }

    await this.userRepository.update(
      { telegramId },
      { department: dept, company: dept.company },
    );

    await ctx.reply('✅ Подразделение успешно обновлено!');
    await this.stateService.clearState(telegramId);
    await this.refreshAndShow(ctx);
  }
}
