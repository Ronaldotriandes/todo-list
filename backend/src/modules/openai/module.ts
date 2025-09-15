import { Module } from '@nestjs/common';
import { PrismaModule } from 'libs/prisma/src';
import { AiController } from './controller';
import { AiService } from './service';

@Module({
    imports: [
        PrismaModule,
    ],
    controllers: [AiController],
    providers: [AiService],
    exports: [AiService],
})
export class AiModule { }
