import { DefaultOptions, UseMutationOptions } from "@tanstack/react-query";
/* eslint-disable @typescript-eslint/no-explicit-any */

export const queryConfig = {
    queries: {
        refetchOnWindowFocus: true,
        retry: false,
        staleTime: 1000 * 60,
    },
} satisfies DefaultOptions;

export type ApiFnReturnType<FnType extends (...args: any) => Promise<any>> =
    Awaited<ReturnType<FnType>>;

export type QueryConfig<T extends (...args: any[]) => any> = Omit<
    ReturnType<T>,
    "queryKey" | "queryFn"
>;

export type MutationConfig<
    MutationFnType extends (...args: any) => Promise<any>
> = UseMutationOptions<
    ApiFnReturnType<MutationFnType>,
    Error,
    Parameters<MutationFnType>[0]
>;
