import { Module } from '@nestjs/common';
import { PrismaModule } from 'libs/prisma/src';
import { TodoController } from './controller';
import { TodoService } from './service';

@Module({
    imports: [
        PrismaModule,
    ],
    controllers: [TodoController],
    providers: [TodoService],
    exports: [TodoService],
})
export class TodoModule { }
