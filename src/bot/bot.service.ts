import { Injectable } from "@nestjs/common";
import { Context, Markup} from "telegraf";
import { Repository } from "typeorm";
import { Report } from "src/domains/entity/report.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/domains/entity/user.entity";
import { Status } from "src/domains/entity/status/status.entity";
import { StateService } from "src/core/state/state.service";
import { RegisterState } from "src/domains/register/register.enum";
import { Company } from "src/domains/entity/company.entity";
import { Department } from "src/domains/entity/department.entity";
import { BaseRouter } from "src/core/route/state-routing";

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
        private readonly router : BaseRouter,
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
                        {text : "Create report", callback_data : "/create_report"},
                        {text : "Get all Reports", callback_data : "/get_reports"},
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

        this.router.exec(state.action, ctx)
    }
}