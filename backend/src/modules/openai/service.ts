import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
@Injectable()
export class AiService {
    private client: OpenAI;

    constructor(
        private configService: ConfigService,

    ) {
        this.client = new OpenAI({
            apiKey: this.configService.get('app.aiApiKey'),
            baseURL: 'https://api.groq.com/openai/v1',
        });
    }
    async suggestTasks(input: string): Promise<string[]> {
        const res = await this.client.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                {
                    role: 'system',
                    content:
                        'Kamu adalah asisten todo. Diberikan sebuah tujuan dari user, buatkan 3 title tugas spesifik dan praktis dalam bahasa Indonesia. Format output: {"tasks":["Tugas 1","Tugas 2","Tugas 3"]}',
                },
                { role: 'user', content: input },
            ],
        });

        const text = res.choices[0].message?.content ?? '[]';

        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                const jsonString = jsonMatch[0];
                const parsed = JSON.parse(jsonString);
                return parsed.tasks || [];
            }

            return [];
        } catch (error) {
            console.error('Error parsing JSON with regex:', error);
            return [];
        }
    }


}