import { Context } from 'telegraf';

export const sendNotAuthorized = async (ctx: Context): Promise<void> => {
  await ctx.reply('⛔ Вы не авторизованы.');
};

export const sendNoPermission = async (ctx: Context): Promise<void> => {
  await ctx.reply('⛔ У вас нет доступа к этому действию.');
};
