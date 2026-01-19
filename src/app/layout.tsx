import type { Metadata } from 'next';
import { AuthProvider } from '@/components/auth';
import '@/styles/globals.css';

export const metadata: Metadata = {
    title: {
        default: 'Periwinkle Auctions',
        template: '%s | Periwinkle Auctions',
    },
    description: 'Real-time online auctions for local communities',
    keywords: ['auctions', 'online auctions', 'bidding', 'local auctions'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
