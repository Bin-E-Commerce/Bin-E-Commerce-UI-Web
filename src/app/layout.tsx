// File này là root layout và nạp global styles/provider; nghiệp vụ shipment nằm ở feature component.

import type { Metadata } from 'next';

import { StoreProvider } from '@/components/providers/StoreProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { Toaster } from '@/components/ui/sonner';
import { NotificationProvider } from '@/common/notifications';
import {
    DEFAULT_OG_IMAGE_URL,
    SITE_DESCRIPTION,
    SITE_NAME,
    SITE_URL,
} from '@/config/site.config';
import './globals.css';
import 'leaflet/dist/leaflet.css';

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: SITE_NAME,
        template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    alternates: { canonical: SITE_URL },
    openGraph: {
        type: 'website',
        locale: 'vi_VN',
        siteName: SITE_NAME,
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        images: [{ url: DEFAULT_OG_IMAGE_URL, alt: SITE_NAME }],
    },
    twitter: {
        card: 'summary_large_image',
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
        images: [DEFAULT_OG_IMAGE_URL],
    },
    robots: { index: true, follow: true },
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
