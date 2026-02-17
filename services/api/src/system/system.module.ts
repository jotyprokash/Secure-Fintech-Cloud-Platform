import { Module, Global } from '@nestjs/common';
import { SystemService } from './system.service';

@Global()
@Module({
    providers: [SystemService],
    exports: [SystemService],
})
export class SystemModule { }
