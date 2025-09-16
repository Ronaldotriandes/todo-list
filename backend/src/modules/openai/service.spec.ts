import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { AiService } from './service';

jest.mock('openai');

describe('AiService', () => {
    let service: AiService;
    let configService: ConfigService;
    let mockOpenAI: jest.Mocked<OpenAI>;

    const mockConfig = {
        'app.aiApiKey': 'test-api-key'
    };

    beforeEach(async () => {
        const mockConfigService = {
            get: jest.fn((key: string) => mockConfig[key])
        };

        const mockCreate = jest.fn();
        mockOpenAI = {
            chat: {
                completions: {
                    create: mockCreate
                }
            }
        } as any;

        (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => mockOpenAI);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiService,
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<AiService>(AiService);
        configService = module.get<ConfigService>(ConfigService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should initialize OpenAI client with correct configuration', () => {
        expect(OpenAI).toHaveBeenCalledWith({
            apiKey: 'test-api-key',
            baseURL: 'https://api.groq.com/openai/v1'
        });
        expect(configService.get).toHaveBeenCalledWith('app.aiApiKey');
    });

    describe('suggestTasks', () => {
        const mockResponse = {
            choices: [{
                message: {
                    content: '{"tasks":["Tugas 1","Tugas 2","Tugas 3"]}'
                }
            }]
        };

        it('should suggest tasks successfully with valid JSON response', async () => {
            (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(mockResponse as any);

            const result = await service.suggestTasks('Belajar programming');

            expect(result).toEqual(['Tugas 1', 'Tugas 2', 'Tugas 3']);
            expect(mockOpenAI.chat.completions.create as jest.Mock).toHaveBeenCalledWith({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: 'Kamu adalah asisten todo. Diberikan sebuah tujuan dari user, buatkan 3 tugas spesifik dan praktis dalam bahasa Indonesia. Format output: {"tasks":["Tugas 1","Tugas 2","Tugas 3"]}'
                    },
                    { role: 'user', content: 'Belajar programming' }
                ]
            });
        });

        it('should handle response with JSON embedded in text', async () => {
            const responseWithExtraText = {
                choices: [{
                    message: {
                        content: 'Berikut adalah tugas-tugas: {"tasks":["Task A","Task B","Task C"]} yang bisa dilakukan.'
                    }
                }]
            };
            (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(responseWithExtraText as any);

            const result = await service.suggestTasks('Test input');

            expect(result).toEqual(['Task A', 'Task B', 'Task C']);
        });

        it('should return empty array when no valid JSON found', async () => {
            const invalidResponse = {
                choices: [{
                    message: {
                        content: 'This is not a valid JSON response'
                    }
                }]
            };
            (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(invalidResponse as any);

            const result = await service.suggestTasks('Test input');

            expect(result).toEqual([]);
        });

        it('should return empty array when JSON is invalid', async () => {
            const invalidJsonResponse = {
                choices: [{
                    message: {
                        content: '{"tasks":["Task 1","Task 2"], invalid: syntax}'
                    }
                }]
            };
            (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(invalidJsonResponse as any);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const result = await service.suggestTasks('Test input');

            expect(result).toEqual([]);
            expect(consoleSpy).toHaveBeenCalledWith('Error parsing JSON with regex:', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('should return empty array when tasks property is missing', async () => {
            const noTasksResponse = {
                choices: [{
                    message: {
                        content: '{"other":"value"}'
                    }
                }]
            };
            (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(noTasksResponse as any);

            const result = await service.suggestTasks('Test input');

            expect(result).toEqual([]);
        });

        it('should handle null/undefined message content', async () => {
            const nullContentResponse = {
                choices: [{
                    message: {
                        content: null
                    }
                }]
            };
            (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(nullContentResponse as any);

            const result = await service.suggestTasks('Test input');

            expect(result).toEqual([]);
        });

        it('should handle undefined message content', async () => {
            const undefinedContentResponse = {
                choices: [{
                    message: {}
                }]
            };
            (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(undefinedContentResponse as any);

            const result = await service.suggestTasks('Test input');

            expect(result).toEqual([]);
        });

        it('should handle OpenAI API errors', async () => {
            const error = new Error('API Error');
            (mockOpenAI.chat.completions.create as jest.Mock).mockRejectedValue(error);

            await expect(service.suggestTasks('Test input')).rejects.toThrow('API Error');
        });

        it('should handle complex nested JSON in response', async () => {
            const complexResponse = {
                choices: [{
                    message: {
                        content: 'Here are some tasks: {"tasks":["Belajar TypeScript","Membuat REST API","Menulis unit test"],"metadata":{"count":3}} for your goal.'
                    }
                }]
            };
            (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(complexResponse as any);

            const result = await service.suggestTasks('Programming goal');

            expect(result).toEqual(['Belajar TypeScript', 'Membuat REST API', 'Menulis unit test']);
        });

        it('should handle empty tasks array', async () => {
            const emptyTasksResponse = {
                choices: [{
                    message: {
                        content: '{"tasks":[]}'
                    }
                }]
            };
            (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(emptyTasksResponse as any);

            const result = await service.suggestTasks('Test input');

            expect(result).toEqual([]);
        });

        it('should handle multiple JSON objects and pick the first valid one', async () => {
            const multipleJsonResponse = {
                choices: [{
                    message: {
                        content: 'Some text {"tasks":["First JSON","Another task"]} and more text'
                    }
                }]
            };
            (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(multipleJsonResponse as any);

            const result = await service.suggestTasks('Test input');

            expect(result).toEqual(['First JSON', 'Another task']);
        });
    });
});