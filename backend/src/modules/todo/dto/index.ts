
import {
    IsDateString,
    IsEnum,
    IsOptional,
    IsString
} from 'class-validator';

export enum StatusData {
    pending = 'pending',
    onProgress = 'onProgress',
    done = 'done',
    overdue = 'overdue',
    canceled = 'canceled'
}
export class CreateTaskDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsDateString()
    dueDate: string;
}

export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsEnum(StatusData)
    status?: StatusData;
}

