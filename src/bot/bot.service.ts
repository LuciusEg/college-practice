import { Injectable } from "@nestjs/common";
import { Context, Markup} from "telegraf";
import { Repository } from "typeorm";
import { Report } from "src/database/entity/report.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/database/entity/user.entity";
import { Status } from "src/database/entity/status/status.entity";
import { StateService } from "src/state/state.service";
import { RegisterState } from "src/state/enum/register.enum";
import { ReportState } from "src/state/enum/report.enum";
import { Company } from "src/database/entity/company.entity";
import { Department } from "src/database/entity/department.entity";
import { Message } from "@telegraf/types/message";
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
        @InjectRepository(Company)
        private readonly companyRepository : Repository<Company>,
        @InjectRepository(Department)
        private readonly departmentRepository : Repository<Department>,        
        private readonly stateService : StateService,
    ){}
    async onStart(ctx : Context){
        const userId = ctx.from?.id
        if(!userId){
            return
        }

        const user = await this.userRepository.findOne({where : {telegramId : String(userId)}})

        if(!user){
            this.stateService.setState(String(userId), RegisterState.FirstName)
            this.onMessage(ctx)
            return
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
    
    async onMessage(ctx: Context) {
        const userId = ctx.from?.id;
        if (!userId) return;

        const state = await this.stateService.getState(String(userId));
        if (!state) return;
        switch (state.action) {
            case ReportState.create_report:
            this.createReport(ctx);
            break;

            case RegisterState.FirstName:
            this.firstName(ctx);
            break;

            case RegisterState.LastName:
            this.lastName(ctx);
            break;

            case RegisterState.MiddleName:
            this.middleName(ctx);
            break;

            case RegisterState.Company:
            this.companyButton(ctx);
            break;
        }
    }


    async firstName(ctx : Context){
        const userId = ctx.from?.id;
        if (!userId) return;

        const user = this.userRepository.create()


        await ctx.reply("Введите ваше имя")

        await this.stateService.setState(String(userId), RegisterState.LastName, user)
    }

    async lastName(ctx : Context){
        const userId = ctx.from?.id;
        const msg = ctx.text;
        if (!userId || !msg) return;

        const state = await this.stateService.getState(String(userId))

        if(!state) return;

        (state.data as User).firstName = msg.trim().toLowerCase();
        await ctx.reply("Введите Фамилию")

        await this.stateService.setState(String(userId), RegisterState.MiddleName, state.data)
    }
    async middleName(ctx: Context) {
        const userId = ctx.from?.id;
        const msg = ctx.text;
        if (!userId || !msg) return;

        const state = await this.stateService.getState(String(userId));
        if (!state) return;

        (state.data as User).lastName = msg.trim().toLowerCase();
        await ctx.reply("Введите отчество");

        await this.stateService.setState(String(userId), RegisterState.Company, state.data);
    }

    async companyButton(ctx: Context) {
        const userId = ctx.from?.id;
        const msg = ctx.text;
        if (!userId || !msg) return;

        const companies = await this.companyRepository.find();
        if (!companies.length) return;

        const state = await this.stateService.getState(String(userId));
        if (!state) return;

        (state.data as User).middleName = msg.trim().toLowerCase();

        await ctx.reply('Выберите предприятие:', {
            reply_markup: {
                inline_keyboard: companies.map((c) => [
                    {
                        text: c.name,
                        callback_data: `select_company_${c.id}`,
                    },
                ]),
            },
        });
        await this.stateService.setState(String(userId), RegisterState.Company, state.data);
    }

    async company(ctx : Context, id : number){
        const userId = ctx.from?.id;
        const company = await this.companyRepository.findOne({ where: { id } });

        if(!company || !userId) return;

        const state = await this.stateService.getState(String(userId))
        if (!state) return;

        (state.data as User).company = company;

        const departments = await this.departmentRepository.find({where : {company}})

        await ctx.reply('Выберите подразделение', {
            reply_markup : {
                inline_keyboard: [
                    departments.map((d) => ({text: d.name,callback_data: `select_department_${d.id}`})),
                ],
            }
        })

        await this.stateService.setState(String(userId), RegisterState.Department, state.data)
    }

    // bot.service.ts
    async department(ctx: Context, id: number) {
        const userId = ctx.from?.id;
        if (!userId || isNaN(id)) return;

        const department = await this.departmentRepository.findOne({ where: { id } });
        if (!department) return;

        const state = await this.stateService.getState(String(userId));
        if (!state) return;

        (state.data as User).department = department;

        const user = this.userRepository.create({
            telegramId: String(userId),
            firstName: (state.data as User).firstName,
            lastName: (state.data as User).lastName,
            middleName: (state.data as User).middleName,
            company: (state.data as User).company,
            department,
        });
        
        await this.userRepository.save(user);
        await this.stateService.clearState(String(userId));
        await ctx.reply('Регистрация завершена.');
    }


    selectReport(ctx : Context){
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
                    
                }else if(ctx.text){
                    ctx.reply(`${ctx.text}`, Markup.inlineKeyboard([
                        [Markup.button.callback("Сделать репорт", "create")]
                    ]));
        }
    }
    
    async createQuestion(ctx: Context) {
        const id = ctx.from?.id
        if(!id) return;
        
        await ctx.reply("Опишите свою проблему")
        this.stateService.setState(String(id), ReportState.create_report)
    }
    
    async createReport(ctx : Context){
        const telegramId = ctx.from?.id
        const user = await this.userRepository.findOne({where : {telegramId : String(telegramId)}})

        if (!telegramId || !user) return;

        const message = ctx.message

        const text = ctx.text ?? "";

        const photoArray = (message as Message.PhotoMessage).photo

        let photoId = ""

        if(photoArray){
            if(photoArray.length > 1){
                photoId = photoArray[photoArray.length - 1].file_id
            }
        }

        const status = await this.statusRepository.findOne({where : {name : StatusCode.NewReport}})

        if (!status) return;

        const report = this.reportRepository.create()

        report.user = user
        report.status = status
        report.created_at = new Date()
        report.status_updated_at = new Date()
        report.text = text
        report.photoId = photoId

        await this.reportRepository.save(report)
        await ctx.reply('Репорт отправлен ✅');
        this.stateService.clearState(String(telegramId))
    }

    async OnGetReports(ctx: Context) {
    const reports = await this.reportRepository.find();
    
    if (reports.length === 0) {
      await ctx.reply('Отчетов не найдено');
      return;
    }

    for (const report of reports) {
      await ctx.replyWithMarkdown(
        `*Отчет #${report.id}*\n` +
        `🕒создано: ${report.created_at.toLocaleDateString()}\n` +
        `🕒изменено: ${report.status_updated_at.toLocaleDateString()}\n` +
        `🔄статус: ${report.status.name}`
      );
    }
  }
}