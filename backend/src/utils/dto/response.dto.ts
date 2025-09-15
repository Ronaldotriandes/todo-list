import { ResponseMessageEnum } from '../enum/response.enum';

export class ResponseDto {
    code?: number = 200;
    success?: boolean = true;
    message?: string = '';
    data?: any;

    constructor(message?: string, data?: any) {
        if (message) this.message = message;
        if (data !== undefined) this.data = data;
    }
}

export class GetResponseDto extends ResponseDto {
    code: number = 200;
    message: string = ResponseMessageEnum.Get;
    data: any = null;
    meta?: any;

    constructor(message?: string, data?: any, meta?: any) {
        super();
        this.code = 200;
        this.message = message || ResponseMessageEnum.Post;
        this.data = data !== undefined ? data : null;
        if (meta) this.meta = meta;
    }
}

export class CreatedResponseDto extends ResponseDto {
    code: number = 201;
    message: string = ResponseMessageEnum.Post;
    data: any = null;

    constructor(message?: string, data?: any) {
        super();
        this.code = 201;
        this.message = message || ResponseMessageEnum.Post;
        this.data = data !== undefined ? data : null;
    }
}

export class UpdatedResponseDto extends ResponseDto {
    code: number = 200;
    message: string = ResponseMessageEnum.Update;
    data: any = null;

    constructor(message?: string, data?: any) {
        super();
        this.code = 200;
        this.message = message || ResponseMessageEnum.Update;
        this.data = data !== undefined ? data : null;
    }
}

export class DeletedResponseDto extends ResponseDto {
    code: number = 200;
    message: string = ResponseMessageEnum.Delete;
    data: any = null;

    constructor(message?: string, data?: any) {
        super();
        this.code = 200;
        this.message = message || ResponseMessageEnum.Delete;
        this.data = data !== undefined ? data : null;
    }
}

export class EnumDto {
    enum: string;
    value: string;
}

export class ServiceResponse {
    code: number;
    message: string;
    data: any = null;
    success: boolean;
}
