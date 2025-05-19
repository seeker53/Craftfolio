import { RegisterForm } from '../components/auth/RegisterForm';

export default function RegisterPage() {
    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Create Account</h1>
            <RegisterForm />
            <p className="mt-4 text-center text-sm">
                Already have an account? <a href="/login" className="text-blue-600">Log in</a>
            </p>
        </div>
    );
}
