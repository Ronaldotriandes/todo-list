import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'libs/prisma/src';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';

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
}