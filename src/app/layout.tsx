import type { Metadata } from 'next';

import { StoreProvider } from '@/components/providers/StoreProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { Toaster } from '@/components/ui/sonner';
import { NotificationProvider } from '@/features/notifications';
import './globals.css';

export const metadata: Metadata = {
    title: 'Bin E-Commerce',
    description: 'Mua sắm thông minh, giá tốt mỗi ngày',
    icons: {
        icon: '/images/logo/logo_icon.png',
    },
};

// Root layout đặt Redux bên ngoài React Query để notification provider đọc được session và dùng chung cache toàn ứng dụng.
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi" className="font-sans" data-scroll-behavior="smooth">
            <body className="min-h-screen bg-background text-foreground antialiased">
                <StoreProvider>
                    <QueryProvider>
                        <NotificationProvider>{children}</NotificationProvider>
                    </QueryProvider>
                    <Toaster position="top-center" />
                </StoreProvider>
            </body>
        </html>
    );
}
