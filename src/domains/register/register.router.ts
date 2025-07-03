// src/features/register/register.router.ts
import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/domains/entity/user.entity';
import { Company } from 'src/domains/entity/company.entity';
import { Department } from 'src/domains/entity/department.entity';

import { StateService } from 'src/core/state/state.service';
import { RegisterState } from 'src/domains/register/register.enum';
import { BaseRouter } from 'src/core/route/state-routing';
import { Context } from 'telegraf';

@Injectable()
export class RegisterRouter {
  constructor(
    private readonly stateService: StateService,
    private readonly router: BaseRouter,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
  ) {
    // Регистрируем обработчики для разных шагов регистрации
    router.register(RegisterState.FirstName, this.firstName.bind(this));
    router.register(RegisterState.LastName, this.lastName.bind(this));
    router.register(RegisterState.MiddleName, this.middleName.bind(this));
    router.register(RegisterState.Company, this.company.bind(this));
    router.register(RegisterState.Department, this.department.bind(this));
  }

  /** Шаг 1: спрашиваем имя и создаём заготовку User */
  async firstName(ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId) return;

    // создаём пустого User
    const user = this.userRepo.create();

    await ctx.reply('Введите ваше имя:');
    await this.stateService.setState(
      String(userId),
      RegisterState.LastName,
      user,
    );
  }

  /** Шаг 2: получаем имя, спрашиваем фамилию */
  async lastName(ctx: Context) {
    const userId = ctx.from?.id;
    const text = ctx?.text;
    if (!userId || !text) return;

    const st = await this.stateService.getState(String(userId));
    if (!st?.data) return;

    const user = st.data as User;
    user.firstName = text.trim();

    await ctx.reply('Введите вашу фамилию:');
    await this.stateService.setState(
      String(userId),
      RegisterState.MiddleName,
      user,
    );
  }

  /** Шаг 3: получаем фамилию, спрашиваем отчество */
  async middleName(ctx: Context) {
    const userId = ctx.from?.id;
    const text = ctx?.text;
    if (!userId || !text) return;

    const st = await this.stateService.getState(String(userId));
    if (!st?.data) return;

    const user = st.data as User;
    user.lastName = text.trim();

    await ctx.reply('Введите ваше отчество:');
    await this.stateService.setState(
      String(userId),
      RegisterState.Company,
      user,
    );
  }

  /**
   * Шаг 4: две ветки:
   * – если это текстовое сообщение → сохраняем отчество, показываем список компаний
   * – если callback_query с выбором компании → сохраняем company, показываем список подразделений
   */
  async company(ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId) return;

    const st = await this.stateService.getState(String(userId));
    if (!st?.data) return;
    const user = st.data as User;

    // 4.1. Обработка callback_query: выбор компании
    const cb = (ctx.update as any).callback_query;
    const data = cb?.data as string | undefined;
    if (data?.startsWith('select_company_')) {
      const m = data.match(/^select_company_(\d+)$/);
      if (!m) return;

      const companyId = Number(m[1]);
      const company = await this.companyRepo.findOne({ where: { id: companyId } });
      if (!company) return;

      user.company = company;

      // Запрашиваем подразделения внутри выбранной компании
      const depts = await this.deptRepo.find({ where: { company } });
      if (!depts.length) {
        await ctx.reply('В этой компании нет подразделений.');
        return;
      }

      await ctx.reply('Выберите подразделение:', {
        reply_markup: {
          inline_keyboard: depts.map(d => [
            { text: d.name, callback_data: `select_department_${d.id}` },
          ]),
        },
      });

      // переводим в следующий шаг
      await this.stateService.setState(
        String(userId),
        RegisterState.Department,
        user,
      );
      return;
    }

    // 4.2. Обработка обычного текста: сохраняем отчество и выводим кнопки компаний
    const text = ctx?.text;
    if (!text) return;

    user.middleName = text.trim();

    const companies = await this.companyRepo.find();
    if (!companies.length) {
      await ctx.reply('Компании не найдены.');
      return;
    }

    await ctx.reply('Выберите предприятие:', {
      reply_markup: {
        inline_keyboard: companies.map(c => [
          { text: c.name, callback_data: `select_company_${c.id}` },
        ]),
      },
    });

    // остаёмся в том же шаге, чтобы обработать callback_query
    await this.stateService.setState(
      String(userId),
      RegisterState.Company,
      user,
    );
  }

  /**
   * Шаг 5: выбор подразделения → финальная сохранение User
   */
  async department(ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId) return;

    const st = await this.stateService.getState(String(userId));
    if (!st?.data) return;
    const user = st.data as User;

    // callback_query с выбором подразделения
    const cb = (ctx.update as any).callback_query;
    const data = cb?.data as string | undefined;
    const m = data?.match(/^select_department_(\d+)$/);
    if (!m) return;

    const deptId = Number(m[1]);
    const dept = await this.deptRepo.findOne({ where: { id: deptId } });
    if (!dept) return;

    user.department = dept;

    // создаём и сохраняем финального пользователя
    const newUser = this.userRepo.create({
      telegramId: String(userId),
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      company: user.company,
      department: user.department,
    });
    await this.userRepo.save(newUser);

    // очищаем состояние и сообщаем об успехе
    await this.stateService.clearState(String(userId));
    await ctx.reply('✅ Регистрация завершена!');
  }
}
