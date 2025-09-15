import { Global, Module } from '@nestjs/common';
import { CurrentUserService } from './service';

@Global()
@Module({
    providers: [CurrentUserService],
    exports: [CurrentUserService],
})
export class CurrentServiceModule { }
