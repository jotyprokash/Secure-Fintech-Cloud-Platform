'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await apiRequest('/auth/login', 'POST', { email, password });
            localStorage.setItem('token', res.access_token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background pointer-events-none" />

            <div className="glass-card w-full max-w-md p-8 rounded-2xl relative z-10">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        NovaPay
                    </h1>
                    <p className="text-gray-400 mt-2">Welcome back to the future of finance</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl input-field focus:ring-2 focus:ring-blue-500/50"
                            placeholder="alice@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl input-field focus:ring-2 focus:ring-blue-500/50"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl btn-primary flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Sign In
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
                        Create one
                    </Link>
                </div>
            </div>
        </div>
    );
}
