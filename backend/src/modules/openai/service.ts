import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
@Injectable()
export class AiService {
    private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

    constructor(
        private configService: ConfigService
    ) { }

    async suggestTasks(input: string): Promise<string[]> {
        try {
            const resp = await axios.post(
                `${this.baseUrl}/chat/completions`,
                {
                    model: 'gemini-1.5-flash',  // atau model lain yang free / terjangkau
                    messages: [
                        {
                            role: 'system',
                            content:
                                'Kamu adalah asisten todo yang membantu membuat daftar tugas. ' +
                                'Diberikan sebuah tujuan dari user, buatkan 3 tugas spesifik dan praktis ' +
                                'dalam bahasa Indonesia. Format output harus JSON. ' +
                                'Contoh: {"tasks": ["Tugas 1", "Tugas 2", "Tugas 3"]}',
                        },
                        { role: 'user', content: input }
                    ],
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.configService.get('app.aiApiKey')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = resp.data;
            // struktur data tergantung respon Gemini
            // misalnya mereka kembalikan "choices" mirip OpenAI, jadi:
            const text = data.choices?.[0]?.message?.content;
            if (!text) return [];
            let cleanedResponse = text.replace(/```json\n?/g, '');
            cleanedResponse = cleanedResponse.replace(/```\n?/g, '');

            // Try to find JSON array in the response
            const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                cleanedResponse = jsonMatch[0];
            }
            console.log(cleanedResponse);
            try {
                const parsed = JSON.parse(cleanedResponse);

                if (parsed.tasks && Array.isArray(parsed.tasks)) {
                    return parsed.tasks;
                }

                // Case 2: raw array
                if (Array.isArray(parsed)) {
                    return parsed;
                }

                return [];
            } catch (e) {
                console.error('Failed to parse AI output:', text);
                return [];
            }
        } catch (error) {
            console.error(error)
            return [];
        }
    }


}