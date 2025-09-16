import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src';
import { QueryGetAll, QueryParams } from 'src/utils/query';
import { CurrentUserService } from '../currentService/service';
import { CreateTaskDto, StatusData, UpdateTaskDto } from './dto';

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

    async updateTask(id: string, body: UpdateTaskDto) {
        const user = await this.currentService.get();
        
        const existingTask = await this.prisma.task.findFirst({
            where: {
                id: id,
                userId: user.id
            }
        });

        if (!existingTask) {
            throw new Error('Task not found or access denied');
        }

        const updateData: any = {};
        if (body.title !== undefined) updateData.title = body.title;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.dueDate !== undefined) updateData.dueDate = new Date(body.dueDate);
        if (body.status !== undefined) updateData.status = body.status;

        return this.prisma.task.update({
            where: { id: id },
            data: updateData,
            select: selectData
        });
    }

    async deleteTask(id: string) {
        const user = await this.currentService.get();
        
        const existingTask = await this.prisma.task.findFirst({
            where: {
                id: id,
                userId: user.id
            }
        });

        if (!existingTask) {
            throw new Error('Task not found or access denied');
        }

        return this.prisma.task.delete({
            where: { id: id }
        });
    }
}