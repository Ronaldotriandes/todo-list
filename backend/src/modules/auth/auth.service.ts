import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'libs/prisma/src';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

interface User {
    id: string;
    fullname: string;
    email: string;
    password: string;
}

@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService,
        private prismaService: PrismaService,
    ) { }


    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = {
            id: user.id,
            email: user.email,
            fullname: user.fullname,
            sub: user.id,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
            }
        };
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        try {

            const datauser = await this.prismaService.user.findFirst({
                where: {
                    email: email,

                },
                select: {
                    id: true,
                    email: true,
                    fullname: true,
                    password: true,
                }
            });

            if (datauser && await bcrypt.compare(password, datauser.password)) {
                return {
                    id: datauser.id,
                    email: datauser.email,
                    fullname: datauser.fullname,
                    password: datauser.password,
                };
            }
            return null;
        } catch (error) {
            console.log(error)
            return null

        }
    }

    async validateUserById(id: string): Promise<User | null> {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
                email: true,
                password: true,
                fullname: true,

            }
        });
        if (user) {
            return {
                id: user.id,
                email: user.email,
                fullname: user.fullname,
                password: user.password,
            }
        }
        return null;
    }

    async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
        try {
            // Check if user already exists
            const existingUser = await this.prismaService.user.findUnique({
                where: { email: registerDto.email }
            });

            if (existingUser) {
                throw new ConflictException('User with this email already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(registerDto.password, 10);

            // Create user
            const user = await this.prismaService.user.create({
                data: {
                    fullname: registerDto.fullname,
                    email: registerDto.email,
                    password: hashedPassword,
                },
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                }
            });

            // Generate JWT token
            const payload = {
                id: user.id,
                email: user.email,
                fullname: user.fullname,
                sub: user.id,
            };

            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    id: user.id,
                    fullname: user.fullname,
                    email: user.email,
                }
            };
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new Error('Failed to create user');
        }
    }
}