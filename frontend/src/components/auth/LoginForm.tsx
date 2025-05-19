import { useForm, SubmitHandler } from 'react-hook-form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/useAuth';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod'; // make sure to import zodResolver

// Define the schema for login
const loginSchema = z.object({
    identifier: z.string().min(3, "Username or email is required"),
    password: z.string().min(6, "Password must be 6+ characters"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function LoginForm() {
    // Hook form with zod validation schema
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormInputs>({
        resolver: zodResolver(loginSchema), // Use zodResolver to handle validation
    });

    const { login: doLogin } = useAuth();

    const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
        console.log("Form submitted with:", data);
        doLogin.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-1">Email or Username</label>
                <Input
                    {...register('identifier', { required: 'This field is required' })}
                    placeholder="you@example.com or username"
                />
                {errors.identifier && (
                    <p className="mt-1 text-xs text-red-600">{errors.identifier.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input
                    type="password"
                    {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Minimum 6 characters' },
                    })}
                    placeholder="••••••••"
                />
                {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
            </div>

            {doLogin.isError && (
                <p className="text-sm text-red-600">
                    Login failed. Please check your credentials.
                </p>
            )}

            <Button type="submit" className="w-full" disabled={doLogin.isPending}>
                {doLogin.isPending ? 'Logging in...' : 'Log In'}
            </Button>
        </form>
    );
}
