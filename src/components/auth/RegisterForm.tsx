'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './AuthForm.module.css';

interface FormErrors {
    email?: string;
    password?: string;
    name?: string;
    general?: string;
}

export function RegisterForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        const formData = new FormData(e.currentTarget);
        const data = {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            name: formData.get('name') as string,
        };

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.issues) {
                    const fieldErrors: FormErrors = {};
                    result.issues.forEach((issue: { path: string[]; message: string }) => {
                        const field = issue.path[0] as keyof FormErrors;
                        fieldErrors[field] = issue.message;
                    });
                    setErrors(fieldErrors);
                } else {
                    setErrors({ general: result.error || 'Registration failed' });
                }
                return;
            }

            // Registration successful, redirect to login
            router.push('/login?registered=true');
        } catch {
            setErrors({ general: 'An unexpected error occurred' });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {errors.general && (
                <div className={styles.errorBanner}>{errors.general}</div>
            )}

            <div className={styles.field}>
                <label htmlFor="name">Full Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    autoComplete="name"
                    placeholder="John Doe"
                />
                {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>

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
                {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>

            <div className={styles.field}>
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                />
                <span className={styles.hint}>
                    Min 8 characters, 1 uppercase, 1 number
                </span>
                {errors.password && <span className={styles.error}>{errors.password}</span>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className={styles.footer}>
                Already have an account? <Link href="/login">Sign in</Link>
            </p>
        </form>
    );
}
