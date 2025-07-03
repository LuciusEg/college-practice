// src/core/routing/base-router.ts
import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';

type Handler = (ctx: Context) => void | Promise<void>;

@Injectable()
export class BaseRouter {
  private readonly routeMap = new Map<string, Handler>();

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
