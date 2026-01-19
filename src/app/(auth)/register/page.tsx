import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Create Account',
    description: 'Create a Periwinkle Auctions account to start bidding',
};

export default function RegisterPage() {
    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Create Account</h1>
            <p className={styles.subtitle}>Join our auction community</p>
            <RegisterForm />
        </div>
    );
}
