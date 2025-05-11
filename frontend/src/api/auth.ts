import axios from 'axios';
import { User } from '../types/user';

// Generic API response wrapper
export interface ApiResponse<T> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
}

// Login API call returns ApiResponse<User>
export const loginUser = async (data: { identifier: string; password: string }): Promise<ApiResponse<User>> => {
    const response = await axios.post<ApiResponse<User>>(
        '/api/auth/login',
        data,
        { withCredentials: true }
    );
    return response.data;
};

// Register API call returns ApiResponse<User>
export const registerUser = async (
    data: { fullName: string; username: string; email: string; password: string }
): Promise<ApiResponse<User>> => {
    const response = await axios.post<ApiResponse<User>>(
        '/api/auth/register',
        data,
        { withCredentials: true }
    );
    return response.data;
};