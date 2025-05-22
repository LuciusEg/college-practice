import { Injectable } from "@nestjs/common";
import { Context } from "telegraf";

@Injectable()
export class BotService{
    async onStart(ctx : Context){
        ctx.reply("Hello!")
    }
}