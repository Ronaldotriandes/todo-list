import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../../libs/prisma/src/index';
import { AuthService } from './auth.service';

jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
    let service: AuthService;
    let prismaService: jest.Mocked<PrismaService>;
    let jwtService: jest.Mocked<JwtService>;

    const mockUser = {
        id: '1',
        email: 'testuser@gmail.com',
        password: 'hashedpassword',
        fullname: 'Test User'
    };

    beforeEach(async () => {
        const mockPrismaService = {
            user: {
                findFirst: jest.fn(),
                findUnique: jest.fn(),
            },
        };

        const mockJwtService = {
            sign: jest.fn(),
            verify: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prismaService = module.get(PrismaService);
        jwtService = module.get(JwtService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateUser', () => {
        it('should return user when credentials are valid', async () => {
            const email = 'testuser@gmail.com';
            const password = 'password123';

            (prismaService.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

            mockedBcrypt.compare.mockResolvedValue(true as never);

            const result = await service.validateUser(email, password);

            expect(result).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                password: mockUser.password,
                fullname: mockUser.fullname
            });
            expect(prismaService.user.findFirst).toHaveBeenCalledWith({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    fullname: true,
                    password: true
                }
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
        });

        it('should return null when user is not found', async () => {
            const email = 'nonexistent';
            const password = 'password123';

            (prismaService.user.findFirst as jest.Mock).mockResolvedValue(null);

            const result = await service.validateUser(email, password);

            expect(result).toBeNull();
            expect(prismaService.user.findFirst).toHaveBeenCalledWith({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    fullname: true,
                    password: true
                }
            });
        });

        it('should return null when password is invalid', async () => {
            const email = 'testuser@gmail.com';
            const password = 'wrongpassword';

            (prismaService.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

            mockedBcrypt.compare.mockResolvedValue(false as never);

            const result = await service.validateUser(email, password);

            expect(result).toBeNull();
            expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
        });



        it('should handle user without additional fields', async () => {
            const email = 'testuser@gmail.com';
            const password = 'password123';
            const userWithoutExtraFields = { ...mockUser };
            (prismaService.user.findFirst as jest.Mock).mockResolvedValue(userWithoutExtraFields);
            mockedBcrypt.compare.mockResolvedValue(true as never);

            const result = await service.validateUser(email, password);

            expect(result).toEqual({
                id: userWithoutExtraFields.id,
                email: userWithoutExtraFields.email,
                password: userWithoutExtraFields.password,
                fullname: userWithoutExtraFields.fullname
            });
        });
    });

    describe('validateUserById', () => {
        it('should return user when id exists', async () => {
            const userId = '1';

            (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const result = await service.validateUserById(userId);

            expect(result).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                password: mockUser.password,
                fullname: mockUser.fullname
            });
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    password: true,
                    fullname: true
                }
            });
        });

        it('should return null when user is not found', async () => {
            const userId = 'nonexistent';

            (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await service.validateUserById(userId);

            expect(result).toBeNull();
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    password: true,
                    fullname: true
                }
            });
        });
    });
});