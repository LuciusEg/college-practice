import { Module } from '@nestjs/common';
import { BaseRouter} from './state-routing';

@Module({
    providers : [BaseRouter],
    exports : [BaseRouter]
})
export class RouteModule {}
