/* eslint-disable @typescript-eslint/no-explicit-any */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { BE_URL } from '../config';
type RequestOptions = {
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean | undefined | null>;
};

export const getErrorMessageByCode = (code: number): string => {
    return `Error ${code}: Request failed`;
};

function buildUrlWithParams(
    url: string,
    params?: RequestOptions["params"]
): string {
    if (!params) return url;
    const filteredParams = Object.fromEntries(
        Object.entries(params).filter(
            ([, value]) => value !== undefined && value !== null
        )
    );
    if (Object.keys(filteredParams).length === 0) return url;
    const queryString = new URLSearchParams(
        filteredParams as Record<string, string>
    ).toString();
    return `${url}?${queryString}`;
}

const API_BASE_URL = `${BE_URL}/api` || 'http://localhost:3000/api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 10000,
});

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        let message = 'Request failed';

        if (error.response) {
            const errorData = error.response.data as any;
            message = errorData?.message || `Error ${error.response.status}: ${error.response.statusText}`;
        } else if (error.request) {
            message = 'Network error - no response received';
        } else {
            message = error.message || 'Request setup failed';
        }

        if (typeof window !== "undefined") {
            console.error('API Error:', message);
        }

        return Promise.reject(new Error(message));
    }
);

async function apiRequest<T>(
    url: string,
    config: AxiosRequestConfig = {}
): Promise<T> {
    const fullUrl = buildUrlWithParams(url, config.params as RequestOptions["params"]);

    try {
        const response = await axiosInstance({
            ...config,
            url: fullUrl,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const api = {
    get<T>(url: string, options?: RequestOptions): Promise<T> {
        return apiRequest<T>(url, {
            method: 'GET',
            headers: options?.headers,
            params: options?.params
        });
    },
    post<T>(url: string, body?: any, options?: RequestOptions): Promise<T> {
        return apiRequest<T>(url, {
            method: 'POST',
            data: body,
            headers: options?.headers,
            params: options?.params
        });
    },
    put<T>(url: string, body?: any, options?: RequestOptions): Promise<T> {
        return apiRequest<T>(url, {
            method: 'PUT',
            data: body,
            headers: options?.headers,
            params: options?.params
        });
    },
    patch<T>(url: string, body?: any, options?: RequestOptions): Promise<T> {
        return apiRequest<T>(url, {
            method: 'PATCH',
            data: body,
            headers: options?.headers,
            params: options?.params
        });
    },
    delete<T>(url: string, options?: RequestOptions): Promise<T> {
        return apiRequest<T>(url, {
            method: 'DELETE',
            headers: options?.headers,
            params: options?.params
        });
    },
};
