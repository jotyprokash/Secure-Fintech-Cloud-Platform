
import axios from 'axios';
import { getCookie } from 'cookies-next';

interface ApiRequestOptions {
    headers?: Record<string, string>;
    [key: string]: any;
}

export const apiRequest = async (
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data: any = null,
    options: ApiRequestOptions = {}
) => {
    const token = getCookie('merchant_token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    try {
        const response = await axios({
            method,
            url: `/api${url}`,
            data,
            headers,
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'API Request Failed');
    }
};
