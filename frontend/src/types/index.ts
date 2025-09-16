/* eslint-disable @typescript-eslint/no-explicit-any */
/* @typescript-eslint/no-empty-object-type */
export interface Question {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface QuestionValue {
    id: number;
    id_question: number;
    id_supervisor: number;
    value: 'strong' | 'agree' | 'natural' | 'disagree' | 'strong_disagree';
    createdAt: string;
    updatedAt: string;
}

export interface Supervisor {
    id: number;
    firstname: string;
    lastname: string;
    experience: number;
    createdAt: string;
    updatedAt: string;
}

export interface QuestionResponse {
    data: Question[];
    meta: {
        totalAssessments?: number;
        totalPages: number;
        page: number;
    };
}

export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

export interface DetailForm {
    firstname: string;
    lastname: string;
    experience: number;
    manyquestionvalue: any[]
}
export interface DetailDTO extends DetailForm {
    data: Question[];
    meta: {
        totalAssessments?: number;
        totalPages: number;
        page: number;
    };
}

export interface DetailAIResponse {
    data: string[];
    meta: {
        totalAssessments?: number;
        totalPages: number;
        page: number;
    };
}

export interface TodoResponse {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    status: 'pending' | 'onProgress' | 'done' | 'canceled';
    createdAt: string;
    updatedAt: string;
}

export interface DetailAllTodos {
    data: TodoResponse[];
    meta: {
        total?: number;
        totalPages: number;
        page: number;
    };
}

export interface LoginDTO {
    access_token: string;
    user: {
        id: string;
        fullname: string;
        email: string;
    }

}