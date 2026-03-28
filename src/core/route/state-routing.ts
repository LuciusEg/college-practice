import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { Context } from 'telegraf';
import { STATE_ROUTE_METADATA } from './state-route.decorator';
import { PERMISSION_METADATA } from '../permission/permission.decorator';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/domains/entity/user.entity';
import {
  sendNoPermission,
  sendNotAuthorized,
} from 'src/domains/response/auth.response';

type Handler = (ctx: Context) => void | Promise<void>;

@Injectable()
export class BaseRouter implements OnModuleInit {
  private readonly routeMap = new Map<string, Handler>();

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  onModuleInit() {
    this.explore();
  }

  private explore() {
    // Получаем все провайдеры во всём приложении
    const providers = this.discoveryService.getProviders();

    providers
      .filter((wrapper) => wrapper.isDependencyTreeStatic() && wrapper.instance)
      .forEach((wrapper) => {
        const { instance } = wrapper;
        const prototype = Object.getPrototypeOf(instance);

        // получаем все методы из прототипа класса
        const methodNames = this.metadataScanner.getAllMethodNames(prototype);

        for (const methodName of methodNames) {
          const method = instance[methodName];
          if (!method) continue;

          // Читаем метаданные нашего декоратора
          const stateKey = this.reflector.get<string>(
            STATE_ROUTE_METADATA,
            method,
          );

          if (stateKey) {
            // Читаем требуемые права для метода, если они есть
            const requiredPermissions = this.reflector.get<string[]>(
              PERMISSION_METADATA,
              method,
            );

            // Создаём обёртку-обработчик
            const handler: Handler = async (ctx) => {
              if (requiredPermissions && requiredPermissions.length > 0) {
                const user_id = ctx.from?.id;

                if (!user_id) {
                  await sendNotAuthorized(ctx);
                  return;
                }

                const user = await this.userRepository.findOne({
                  where: { telegramId: String(user_id) },
                  relations: ['roles'],
                });

                // Можно поменять логику на /start либо пустое сообщение
                if (!user) {
                  await sendNotAuthorized(ctx);
                  return;
                }

                const hasAccess = user.roles.some((role) =>
                  requiredPermissions.includes(role.name),
                );

                if (!hasAccess) {
                  await sendNoPermission(ctx);
                  return;
                }

                // Кладем и здесь юзера в карман, так как это кастомный роутер!
                ctx.state.user = user;
              }
              return method.call(instance, ctx);
            };

            // Регистрируем нашу обёртку вместо прямого `method.bind(instance)`
            this.register(stateKey, handler);
            console.log(
              `[Router] Registered state handler [${stateKey}] for ${instance.constructor.name}.${methodName}`,
            );
          }
        }
      });
  }

  exec(key: string, ctx: Context) {
    const fn = this.routeMap.get(key);
    if (fn) {
      return fn(ctx);
    }
    console.warn(`[Router] no handler for ${key}`);
  }

  register(key: string, handler: Handler) {
    this.routeMap.set(key, handler);
  }
}
