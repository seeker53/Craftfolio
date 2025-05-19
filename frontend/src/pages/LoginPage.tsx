import { LoginForm } from '../components/auth/LoginForm';

export default function LoginPage() {
    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Log In</h1>
            <LoginForm />
            <p className="mt-4 text-center text-sm">
                Don’t have an account? <a href="/register" className="text-blue-600">Register</a>
            </p>
        </div>
    );
}
