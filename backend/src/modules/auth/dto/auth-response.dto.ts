export class AuthResponseDto {
    access_token: string;
    user: {
        id: string;
        fullname: string;
        email: string;
    };
}