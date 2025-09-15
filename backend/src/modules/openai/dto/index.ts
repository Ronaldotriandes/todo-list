
import {
    IsDateString,
    IsOptional,
    IsString
} from 'class-validator';

export enum StatusData {
    pending = 'pending',
    onProgress = 'onProgress',
    done = 'done',
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

    @IsString()
    status: StatusData;




}

