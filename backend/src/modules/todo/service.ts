import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src';
import { QueryGetAll, QueryParams } from 'src/utils/query';
import { CurrentUserService } from '../currentService/service';
import { CreateTaskDto, StatusData } from './dto';

const selectData = {
    id: true,
    title: true,
    description: true,
    dueDate: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    user: {
        select: {
            id: true,
            fullname: true,
        }
    }

}
@Injectable()
export class TodoService {
    constructor(private readonly prisma: PrismaService,
        private readonly currentService: CurrentUserService
    ) { }

    async getAllData(query: QueryParams) {

        return QueryGetAll(this.prisma.task, query, [], {
            select: selectData
        });
    }
    async createTask(body: CreateTaskDto) {
        const user = await this.currentService.get();
        const data = {
            title: body.title,
            description: body.description,
            dueDate: new Date(body.dueDate),
            status: StatusData.pending,
            userId: user.id
        }
        return this.prisma.task.create({
            data: data,
            select: selectData
        });
    }



}