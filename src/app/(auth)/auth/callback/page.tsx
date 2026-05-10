'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';

import { authService } from '@/services/auth.service';
import { setAuth } from '@/store/slices/authSlice';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { AppDispatch } from '@/store';

export default function CallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        let cancelled = false;

        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const provider = sessionStorage.getItem('oauth_provider');

        if (!code || !state || !provider) {
            toast.error('Đăng nhập thất bại. Vui lòng thử lại.');
            router.replace('/login');
            return;
        }

        // Xóa ngay để StrictMode remount không đọc lại cùng provider
        sessionStorage.removeItem('oauth_provider');

        authService
            .socialCallback(provider, code, state)
            .then((res) => {
                if (cancelled) return;
                dispatch(
                    setAuth({
                        accessToken: res.data.accessToken,
                        user: res.data.user,
                    }),
                );
                toast.success(`Đăng nhập bằng ${provider} thành công!`);
                router.replace('/');
            })
            .catch((err) => {
                if (cancelled) return;
                toast.error(getErrorMessage(err));
                router.replace('/login');
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <p className="text-zinc-500 text-sm animate-pulse">
                Đang xử lý đăng nhập…
            </p>
        </div>
    );
}
