'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import styles from './AuthForm.module.css';

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const registered = searchParams.get('registered') === 'true';
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
                return;
            }

            router.push(callbackUrl);
            router.refresh();
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {registered && (
                <div className={styles.successBanner}>
                    Account created! Please sign in.
                </div>
            )}

            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.field}>
                <label htmlFor="email">Email Address</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className={styles.footer}>
                Don&apos;t have an account? <Link href="/register">Create one</Link>
            </p>
        </form>
    );
}
