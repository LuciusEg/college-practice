
import { Context, Scenes } from "telegraf";
import { BotService } from "./bot.service";
import { Action, Ctx, On, Start, TelegrafContextType, Update } from "nestjs-telegraf";

@Update()
export class BotUpdate{
    constructor(private readonly botService : BotService){}
    @Start()
    onStart(@Ctx() ctx : Context){
        this.botService.onStart(ctx)
    }

    @On('message')
    onMessage(@Ctx() ctx : Context){
        this.botService.onMessage(ctx)
    }

    @Action('create')
    onCreate(@Ctx() ctx : Context){
        ctx.answerCbQuery()
        this.botService.create(ctx)
    }
}