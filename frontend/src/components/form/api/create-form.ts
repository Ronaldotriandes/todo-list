import { api } from "@/lib/api-client";
import { ApiResponse, DetailDTO, DetailForm } from "@/types";

export const CreateForm = ({
    body,
}: {
    body: DetailForm;
}): Promise<ApiResponse<DetailDTO>> => {
    return api.post(
        `/supervisors`,
        body
    );
};
