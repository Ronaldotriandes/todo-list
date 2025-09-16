import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CreatedResponseDto, GetResponseDto, ResponseDto } from 'src/utils/dto/response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { TodoService } from './service';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodoController {
    constructor(private readonly todoService: TodoService) { }
    @Get()
    async getAllData(@Query() query: any) {
        const result = await this.todoService.getAllData(query);
        return new GetResponseDto('Todos successfully', result.data, result.meta);
    }
    @Post()
    async createTask(@Body() body: CreateTaskDto) {
        const result = await this.todoService.createTask(body);
        return new CreatedResponseDto('Todos successfully', result);
    }

    @Put(':id')
    async updateTask(@Param('id') id: string, @Body() body: UpdateTaskDto) {
        const result = await this.todoService.updateTask(id, body);
        return new ResponseDto('Todo updated successfully', result);
    }

    @Delete(':id')
    async deleteTask(@Param('id') id: string) {
        await this.todoService.deleteTask(id);
        return new ResponseDto('Todo deleted successfully', null);
    }
}