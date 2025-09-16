import { api } from "@/lib/api-client";
import { TokenManager } from "@/lib/auth-tokens";
import { ApiResponse, TodoResponse } from "@/types";
import { DetailAllTodos } from "@/types/index";

export const getTodos = (
    { page = 1, search }: { page?: number; search?: string } = {}
): Promise<DetailAllTodos> => {
    return api.get(`/todos`, {
        params: {
            page,
            'wherelike-title': search,
        },
    });
};
export const CreateTodo = ({
    body,
}: {
    body: {
        title: string;
        description: string;
        dueDate: string;
    };
}): Promise<ApiResponse<TodoResponse>> => {
    const token = TokenManager.getTokens()
    return api.post(
        `/todos`,
        body,
        {
            headers: {
                Authorization: `Bearer ${token?.accessToken}`
            }
        }
    );
};

export const UpdateTodo = ({
    id,
    body,
}: {
    id: string;
    body: {
        title?: string;
        description?: string;
        dueDate?: string;
        status?: 'pending' | 'onProgress' | 'done' | 'canceled';
    };
}): Promise<ApiResponse<TodoResponse>> => {
    const token = TokenManager.getTokens()
    return api.put(
        `/todos/${id}`,
        body,
        {
            headers: {
                Authorization: `Bearer ${token?.accessToken}`
            }
        }
    );
};

export const DeleteTodo = ({
    id,
}: {
    id: string;
}): Promise<ApiResponse<null>> => {
    const token = TokenManager.getTokens()
    return api.delete(
        `/todos/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token?.accessToken}`
            }
        }
    );
};
