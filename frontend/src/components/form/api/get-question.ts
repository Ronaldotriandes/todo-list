import { api } from "@/lib/api-client";
import { QueryConfig } from "@/lib/query";
import { DetailDTO } from "@/types/index";
import {
    queryOptions,
    useQuery
} from "@tanstack/react-query";

export const getQuestion = (
    { page = 1, search }: { page?: number; search?: string } = {}
): Promise<DetailDTO> => {
    return api.get(`/questions`, {
        params: {
            page,
            search,
        },
    });
};

export const getQuestionQueryOptions = (params: { page?: number; search?: string } = {}) => {
    return queryOptions({
        queryKey: ["questions", params],
        queryFn: () => getQuestion(params),
    });
};

type UseQuestionOptions = {
    page?: number;
    search?: string;
    queryConfig?: QueryConfig<typeof getQuestionQueryOptions>;
};

export const useQuestion = ({ page, search, queryConfig }: UseQuestionOptions = {}) => {
    return useQuery({
        ...getQuestionQueryOptions({ page, search }),
        ...queryConfig,
    });
};

