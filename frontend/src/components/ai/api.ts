import { api } from "@/lib/api-client";
import { TokenManager } from "@/lib/auth-tokens";
import { ApiResponse } from "@/types";

export const CreateSuggestion = ({
    body,
}: {
    body: { goal: string };
}): Promise<ApiResponse<string[]>> => {
    const token = TokenManager.getTokens()
    return api.post(
        `/ai`,
        body,
        {
            headers: {
                Authorization: `Bearer ${token?.accessToken}`
            }
        }
    );
};
