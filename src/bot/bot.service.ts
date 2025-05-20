import { Injectable } from "@nestjs/common";
import { Context, Markup, Scenes } from "telegraf";
import { button, inlineKeyboard } from "telegraf/typings/markup";
import { Repository } from "typeorm";
import { Report } from "src/database/entity/report.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/database/entity/user.entity";
import { Status } from "src/database/entity/status/status.entity";
import { StatusCode } from "src/database/entity/status/status.enum";

@Injectable()
export class BotService{
    constructor(
        @InjectRepository(Report)
        private readonly reportRepository : Repository<Report>,
        @InjectRepository(User)
        private readonly userRepository : Repository<User>,
        @InjectRepository(Status)
        private readonly statusRepository : Repository<Status>,
    ){}
    async onStart(ctx : Context){
        const userId = ctx.from?.id
        if(!userId){
            return
        }

        const user = await this.userRepository.findOne({where : {telegramId : String(userId)}})

        if(!user){
            const user = this.userRepository.create({
                telegramId : String(userId),
                name : ctx.from?.username ?? "no_username",
            })

            await this.userRepository.save(user)
        }

        ctx.reply("Выберите операцию:", {
            reply_markup : {
                inline_keyboard : [
                    [
                        {text : "Create report", callback_data : "create_report"},
                        {text : "Get all Reports", callback_data : "get_reports"},
                    ]
                ]
            }
        })
    }
    
    async onMessage(ctx : Context){
        const photos = (ctx.message as any).photo;

        if(photos && photos.length > 0){
            const id = photos[photos.length - 1].file_id;
            ctx.replyWithPhoto(id, {
                caption : `${ctx.text ?? ''}`,
                ...Markup.inlineKeyboard([
                    [
                        Markup.button.callback("Сделать репорт", "create")
                    ]
                ])
            })
            
        }
    }

    async create(ctx: Context) {
        const msg = ctx.callbackQuery?.message;
        if (!msg) return;

        const text    = (msg as any).caption ?? (msg as any).text    ?? 'no text';
        const photos  = (msg as any).photo  as Array<{ file_id: string }>;
        const photoId = photos?.length
            ? photos[photos.length - 1].file_id
            : 'no photo';


        const id = ctx.from?.id ?? 0
        const user =  await this.userRepository.findOne({where : {telegramId : String(id)}})

        const status = await this.statusRepository.findOne({where : {status : StatusCode.NewReport}})

        if(!user || !status){
            return
        }

        const report = this.reportRepository.create({
            user,
            photoId,
            text,
            created_at : new Date(),
            status_updated_at : new Date(),
            status,
        })

        await this.reportRepository.save(report);
        await ctx.deleteMessage();
        await ctx.reply('Репорт отправлен ✅');
    }
}