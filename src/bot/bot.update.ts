
import { Context } from "telegraf";
import { BotService } from "./bot.service";
import { Ctx, Start, TelegrafContextType, Update } from "nestjs-telegraf";

@Update()
export class BotUpdate{
    constructor(private readonly botService : BotService){}
    @Start()
    onStart(@Ctx() ctx : Context){
        this.botService.onStart(ctx)
    }
}