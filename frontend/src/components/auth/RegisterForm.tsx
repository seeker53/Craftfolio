import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useAuth } from '../../hooks/useAuth'

// Zod schema (same as before)
const registerSchema = z
    .object({
        fullName: z.string().min(3, 'Full name must be at least 3 characters'),
        username: z.string().min(3, 'Username must be at least 3 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be 6+ characters'),
        confirmPassword: z.string().min(6, 'Confirm your password'),
        profileImage: z.preprocess(
            (val) => (val as FileList)?.[0] ?? null,
            z
                .instanceof(File, { message: 'Profile image is required' })
                .refine((f) => f.type.startsWith('image/'), {
                    message: 'Only image files are allowed',
                })
        ),
        coverImage: z.preprocess(
            (val) => (val as FileList)?.[0] ?? undefined,
            z
                .instanceof(File, { message: 'Cover image must be a file' })
                .refine((f) => f.type.startsWith('image/'), {
                    message: 'Only image files are allowed',
                })
                .optional()
        ),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: 'Passwords must match',
        path: ['confirmPassword'],
    })

export function RegisterForm() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(registerSchema),
    })

    const { register: doRegister } = useAuth()

    // no explicit type annotation—RHF infers it from your schema
    const onSubmit = (data: any) => {
        const formData = new FormData()
        formData.append('fullName', data.fullName)
        formData.append('username', data.username)
        formData.append('email', data.email)
        formData.append('password', data.password)
        formData.append('profileImage', data.profileImage)
        if (data.coverImage) {
            formData.append('coverImage', data.coverImage)
        }
        doRegister.mutate(formData)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" className="space-y-6">
            {/* Full Name */}
            <div>
                <label>Full Name</label>
                <Input {...register('fullName')} placeholder="John Doe" />
                {errors.fullName && <p>{errors.fullName.message}</p>}
            </div>

            {/* Username */}
            <div>
                <label>Username</label>
                <Input {...register('username')} placeholder="johndoe" />
                {errors.username && <p>{errors.username.message}</p>}
            </div>

            {/* Email */}
            <div>
                <label>Email</label>
                <Input {...register('email')} placeholder="you@example.com" />
                {errors.email && <p>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
                <label>Password</label>
                <Input type="password" {...register('password')} placeholder="••••••••" />
                {errors.password && <p>{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
                <label>Confirm Password</label>
                <Input type="password" {...register('confirmPassword')} placeholder="••••••••" />
                {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}
            </div>

            {/* Profile Image */}
            <div>
                <label>Profile Image</label>
                <input type="file" accept="image/*" {...register('profileImage')} />
                {errors.profileImage && <p>{errors.profileImage.message}</p>}
            </div>

            {/* Cover Image */}
            <div>
                <label>Cover Image (optional)</label>
                <input type="file" accept="image/*" {...register('coverImage')} />
                {errors.coverImage && <p>{errors.coverImage.message}</p>}
            </div>

            {doRegister.isError && <p>Registration failed. Please try again.</p>}

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Registering…' : 'Register'}
            </Button>
        </form>
    )
}
