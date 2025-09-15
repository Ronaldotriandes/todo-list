import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from 'libs/prisma/src';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { CurrentServiceModule } from './modules/currentService/module';
import { AiModule } from './modules/openai/module';
import { TodoModule } from './modules/todo/module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: [
        '.env.local',
        `.env.${process.env.NODE_ENV}`,
        '.env',
      ],
    }),
    PrismaModule,
    AuthModule,
    CurrentServiceModule,
    AiModule,
    TodoModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
