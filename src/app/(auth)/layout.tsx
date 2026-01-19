import type { ReactNode } from 'react';
import Link from 'next/link';
import styles from './layout.module.css';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoIcon}>🔮</span>
                    <span className={styles.logoText}>Periwinkle</span>
                </Link>
                {children}
            </div>
        </div>
    );
}
