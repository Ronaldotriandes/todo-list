import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'libs/prisma/src';
import { CurrentUserService } from '../currentService/service';
import { CreateTaskDto, StatusData, UpdateTaskDto } from './dto';
import { TodoService } from './service';

describe('TodoService', () => {
    let service: TodoService;
    let prismaService: any;
    let currentUserService: any;

    const mockUser = {
        id: 'user-1',
        fullname: 'Test User',
        email: 'test@example.com'
    };

    const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test Description',
        dueDate: new Date('2024-12-31'),
        status: StatusData.pending,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
            id: 'user-1',
            fullname: 'Test User'
        }
    };

    beforeEach(async () => {
        const mockPrismaService = {
            task: {
                create: jest.fn().mockResolvedValue(mockTask),
                findFirst: jest.fn().mockResolvedValue(mockTask),
                update: jest.fn().mockResolvedValue(mockTask),
                delete: jest.fn().mockResolvedValue(mockTask)
            }
        };

        const mockCurrentUserService = {
            get: jest.fn().mockResolvedValue(mockUser)
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TodoService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: CurrentUserService,
                    useValue: mockCurrentUserService,
                },
            ],
        }).compile();

        service = module.get<TodoService>(TodoService);
        prismaService = module.get(PrismaService);
        currentUserService = module.get(CurrentUserService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createTask', () => {
        const createTaskDto: CreateTaskDto = {
            title: 'New Task',
            description: 'New Description',
            dueDate: '2024-12-31'
        };

        it('should create a task successfully', async () => {
            const result = await service.createTask(createTaskDto);

            expect(result).toEqual(mockTask);
            expect(currentUserService.get).toHaveBeenCalledTimes(1);
            expect(prismaService.task.create).toHaveBeenCalledWith({
                data: {
                    title: createTaskDto.title,
                    description: createTaskDto.description,
                    dueDate: new Date(createTaskDto.dueDate),
                    status: StatusData.pending,
                    userId: mockUser.id
                },
                select: expect.any(Object)
            });
        });

        it('should create task with invalid date', async () => {
            const invalidDateDto = { ...createTaskDto, dueDate: 'invalid-date' };
            
            const result = await service.createTask(invalidDateDto);

            expect(result).toEqual(mockTask);
            expect(prismaService.task.create).toHaveBeenCalled();
            
            const createCall = prismaService.task.create.mock.calls[0][0];
            expect(createCall.data.title).toBe(invalidDateDto.title);
            expect(createCall.data.description).toBe(invalidDateDto.description);
            expect(isNaN(createCall.data.dueDate.getTime())).toBe(true); // Check if date is invalid
            expect(createCall.data.status).toBe(StatusData.pending);
            expect(createCall.data.userId).toBe(mockUser.id);
        });
    });

    describe('updateTask', () => {
        const updateTaskDto: UpdateTaskDto = {
            title: 'Updated Task',
            description: 'Updated Description',
            status: StatusData.canceled
        };

        it('should update a task successfully', async () => {
            const updatedTask = { ...mockTask, ...updateTaskDto };
            prismaService.task.update.mockResolvedValue(updatedTask);

            const result = await service.updateTask('task-1', updateTaskDto);

            expect(result).toEqual(updatedTask);
            expect(prismaService.task.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 'task-1',
                    userId: mockUser.id
                }
            });
            expect(prismaService.task.update).toHaveBeenCalledWith({
                where: { id: 'task-1' },
                data: updateTaskDto,
                select: expect.any(Object)
            });
        });

        it('should throw error when task not found', async () => {
            prismaService.task.findFirst.mockResolvedValue(null);

            await expect(service.updateTask('task-1', updateTaskDto)).rejects.toThrow('Task not found or access denied');
        });

        it('should handle partial updates', async () => {
            const partialUpdate = { title: 'Only Title Updated' };
            const updatedTask = { ...mockTask, title: partialUpdate.title };
            prismaService.task.update.mockResolvedValue(updatedTask);

            const result = await service.updateTask('task-1', partialUpdate);

            expect(result).toEqual(updatedTask);
            expect(prismaService.task.update).toHaveBeenCalledWith({
                where: { id: 'task-1' },
                data: partialUpdate,
                select: expect.any(Object)
            });
        });

        it('should handle dueDate updates', async () => {
            const dateUpdate = { dueDate: '2025-01-15' };
            const updatedTask = { ...mockTask, dueDate: new Date(dateUpdate.dueDate) };
            prismaService.task.update.mockResolvedValue(updatedTask);

            await service.updateTask('task-1', dateUpdate);

            expect(prismaService.task.update).toHaveBeenCalledWith({
                where: { id: 'task-1' },
                data: { dueDate: new Date(dateUpdate.dueDate) },
                select: expect.any(Object)
            });
        });
    });

    describe('deleteTask', () => {
        it('should delete a task successfully', async () => {
            const result = await service.deleteTask('task-1');

            expect(result).toEqual(mockTask);
            expect(prismaService.task.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 'task-1',
                    userId: mockUser.id
                }
            });
            expect(prismaService.task.delete).toHaveBeenCalledWith({
                where: { id: 'task-1' }
            });
        });

        it('should throw error when task not found for deletion', async () => {
            prismaService.task.findFirst.mockResolvedValue(null);

            await expect(service.deleteTask('task-1')).rejects.toThrow('Task not found or access denied');
        });
    });
});