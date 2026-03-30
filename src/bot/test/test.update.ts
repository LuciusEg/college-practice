import { Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { UseInterceptors } from '@nestjs/common';
import { PermissionInterceptor } from 'src/core/permission/permission.interceptor';
import { Permission } from 'src/core/permission/permission.decorator';
import { RoleCode } from 'src/domains/entity/role/role.enum';
import { StateService } from 'src/core/state/state.service';
import { StateRoute } from 'src/core/route/state-route.decorator';
import { BotService } from '../bot.service';

export const TEST_STATE = 'TEST_STATE';
@Update()
export class TestUpdate {
  constructor(
    private readonly stateService: StateService,
    private readonly botService: BotService,
  ) {}
  @UseInterceptors(PermissionInterceptor)
  @Permission(RoleCode.User)
  @Command('test')
  async test(@Ctx() ctx: Context) {
    await ctx.reply('работает');
  }

  @UseInterceptors(PermissionInterceptor)
  @Permission(RoleCode.User)
  @Command('getTestState')
  async anotherTest(@Ctx() ctx: Context) {
    const user = ctx.state.user;
    this.stateService.setState(String(user.telegramId), TEST_STATE, user);
    this.botService.onMessage(ctx);
  }

  @UseInterceptors(PermissionInterceptor)
  @Permission(RoleCode.User)
  @StateRoute(TEST_STATE)
  async testState(@Ctx() ctx: Context) {
    const user = ctx.state.user;
    await this.stateService.clearState(String(user.telegramId));
    await ctx.reply(
      `Здравствуйте, ${user.firstName} ${user.lastName} ${user.middleName}`,
    );
  }
}
