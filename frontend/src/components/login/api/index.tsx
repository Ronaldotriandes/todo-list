import { api } from "@/lib/api-client";
import { ApiResponse, LoginDTO } from "@/types";

export const LoginForm = ({
    body,
}: {
    body: {
        email: string;
        password: string;
    };
}): Promise<ApiResponse<LoginDTO>> => {
    return api.post(
        `/auth/login`,
        body
    );
};
