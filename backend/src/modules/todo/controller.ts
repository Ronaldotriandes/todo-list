import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CreatedResponseDto, GetResponseDto } from 'src/utils/dto/response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTaskDto } from './dto';
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
}