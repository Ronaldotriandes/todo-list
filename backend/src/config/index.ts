import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
    port: parseInt(process?.env?.PORT ?? '3000', 10),
    apiPrefix: process.env.API_PREFIX || 'api/v1',
    environment: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
    adminUrl: process.env.ADMIN_URL || 'http://localhost:3002',
    aiApiKey: process.env.AI_API_KEY || 'your-openai-api-key',
}));
