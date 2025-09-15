import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GetResponseDto } from 'src/utils/dto/response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
    constructor(private readonly aiService: AiService) { }
    @Post()
    async suggestTasks(@Body() body: { goal: string }) {
        const result = await this.aiService.suggestTasks(body.goal);
        return new GetResponseDto('Member successfully', result);
    }

}