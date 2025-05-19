import { useMutation } from '@tanstack/react-query';
import { loginUser, registerUser } from '../api/auth';
import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
    const setUser = useAuthStore((s) => s.setUser);
    const navigate = useNavigate();

    // Login mutation: on success, store user and go to dashboard
    const login = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            setUser(data.data);
            navigate('/dashboard'); // assuming API response is ApiResponse<User>
        },
        onError: (error) => {
            console.error('Login error:', error);
        }
    });

    // Register mutation: on success, redirect to login page
    const register = useMutation({
        mutationFn: registerUser,
        onSuccess: () => {
            // Optionally show a toast: "Registration successful! Please log in."
            navigate('/login');
        },
    });

    return { login, register };
};