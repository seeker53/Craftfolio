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
        onSuccess: (res) => {
            setUser(res.data);
            navigate('/dashboard');
        },
    });

    // Register mutation: on success, redirect to login page
    const register = useMutation({
        mutationFn: registerUser,
        onSuccess: (res) => {
            // Optionally show a toast: "Registration successful! Please log in."
            navigate('/login');
        },
    });

    return { login, register };
};