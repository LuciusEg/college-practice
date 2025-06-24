import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Context } from "telegraf";

export class UserDefaultGuard implements CanActivate {
    constructor(

    ){}
    canActivate(context: ExecutionContext): boolean {
        const ctx = context.getArgByIndex(0) as Context

        const id = ctx.from?.id
        if(!id) return false;
        console.log(`Ctx's id from Guard: ${id}`)
        return true
    }
}