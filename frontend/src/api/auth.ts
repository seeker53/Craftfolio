import { api } from '../lib/api'; // <- centralized axios instance
import { User } from '../types/user';

export interface ApiResponse<T> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
}

export const loginUser = async (
    data: { identifier: string; password: string }
): Promise<ApiResponse<User>> => {
    // Send the correct fields to the backend (email instead of identifier)
    const response = await api.post<ApiResponse<User>>('/api/v1/auth/login', data);
    return response.data;
};


export const registerUser = async (formData: FormData): Promise<ApiResponse<User>> => {
    const response = await api.post('/api/v1/auth/register', formData, {
        withCredentials: true,
    });
    return response.data;
};


api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // maybe trigger logout
        }
        return Promise.reject(error);
    }
);
