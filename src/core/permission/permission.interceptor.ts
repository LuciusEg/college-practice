import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, of } from 'rxjs';
import { User } from 'src/domains/entity/user.entity';
import { PERMISSION_METADATA } from './permission.decorator';
import { Context } from 'telegraf';
import {
  sendNoPermission,
  sendNotAuthorized,
} from 'src/domains/response/auth.response';

@Injectable()
export class PermissionInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const requiredPermissions = this.reflector.get<string[]>(
      PERMISSION_METADATA,
      context.getHandler(),
    );

    // Нет декоратора @Permission — пропускаем всех
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return next.handle();
    }

    const ctx = TelegrafExecutionContext.create(context).getContext<Context>();
    const user_id = ctx.from?.id;

    if (!user_id) {
      await sendNotAuthorized(ctx);
      return of(undefined); // Тихо останавливаем выполнение, без исключений!
    }

    const user = await this.userRepository.findOne({
      where: { telegramId: String(user_id) },
      relations: ['roles', 'company', 'department'],
    });

    if (!user) {
      await sendNotAuthorized(ctx);
      return of(undefined);
    }

    ctx.state.user = user;

    const hasAccess =
      user.roles &&
      user.roles.some((role) => requiredPermissions.includes(role.name));

    if (!hasAccess) {
      await sendNoPermission(ctx);
      return of(undefined);
    }

    return next.handle(); // Всё ок — пропускаем к оригинальному методу
  }
}
