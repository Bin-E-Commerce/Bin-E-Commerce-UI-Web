'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import type { RootState } from '@/store';

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, initialized } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (initialized && !user) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [initialized, user, router, pathname]);

    // Render nothing while auth is being initialized or after logout (before redirect fires)
    if (!initialized || !user) return null;

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
