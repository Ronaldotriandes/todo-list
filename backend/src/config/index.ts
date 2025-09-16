import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
    port: parseInt(process?.env?.PORT ?? '3000', 10),
    environment: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    aiApiKey: process.env.AI_API_KEY || 'your-openai-api-key',
}));
