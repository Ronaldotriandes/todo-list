import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class CurrentUserService {
    constructor(@Inject(REQUEST) private readonly request: Request) { }

    get<T = any>(): T | null {
        return this.request.user as T ?? null;
    }

    getField<T = any>(field: string): T | null {
        return this.request.user ? this.request.user[field] : null;
    }
}