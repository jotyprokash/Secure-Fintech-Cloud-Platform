export const API_URL = '/api';

export async function apiRequest(endpoint: string, method: string = 'GET', body?: any) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || 'Request failed');
    }

    return res.json();
}
