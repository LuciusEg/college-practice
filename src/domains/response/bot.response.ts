import { Context } from 'telegraf';

export const sendUnknownCommand = async (ctx: Context): Promise<void> => {
  await ctx.reply(
    'Извините, я вас не понял. Пожалуйста, напишите команду /start.',
  );
};
