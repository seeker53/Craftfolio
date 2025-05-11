import { useForm, SubmitHandler } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const registerSchema = z
    .object({
        fullName: z.string().min(3, "Full name must be at least 3 characters"),
        username: z.string().min(3, "Username must be at least 3 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be 6+ characters"),
        confirmPassword: z.string().min(6),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords must match",
        path: ["confirmPassword"],
    });

type RegisterFormInputs = z.infer<typeof registerSchema>;

export function RegisterForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormInputs>({
        resolver: zodResolver(registerSchema),
    });

    const { register: doRegister } = useAuth();

    const onSubmit: SubmitHandler<RegisterFormInputs> = (data) => {
        // omit confirmPassword before sending to API
        const { fullName, username, email, password } = data;
        doRegister.mutate({ fullName, username, email, password });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <Input {...register("username")} placeholder="johndoe" />
                {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input {...register("email")} placeholder="you@example.com" />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input type="password" {...register("password")} placeholder="••••••••" />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <Input type="password" {...register("confirmPassword")} placeholder="••••••••" />
                {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
                )}
            </div>

            {doRegister.isError && (
                <p className="text-sm text-red-600">
                    Registration failed. {(doRegister.error as any)?.message || "Please try again."}
                </p>
            )}

            <Button type="submit" className="w-full" disabled={doRegister.isPending}>
                {doRegister.isPending ? "Registering..." : "Register"}
            </Button>
        </form>
    );
}
