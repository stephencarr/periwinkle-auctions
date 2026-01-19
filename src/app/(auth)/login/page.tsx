import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Sign In',
    description: 'Sign in to your Periwinkle Auctions account',
};

export default function LoginPage() {
    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Sign in to continue bidding</p>
            <Suspense fallback={<div>Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
