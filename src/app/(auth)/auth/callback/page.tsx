'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { authService } from '@/services/auth.service';
import { setAuth } from '@/store/slices/authSlice';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { AppDispatch } from '@/store';

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();
    const called = useRef(false);

    useEffect(() => {
        if (called.current) return;
        called.current = true;

        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const oauthError = searchParams.get('error');

        if (oauthError) {
            toast.error(
                `Đăng nhập thất bại: ${searchParams.get('error_description') ?? oauthError}`,
            );
            router.replace('/login');
            return;
        }

        if (!code || !state) {
            toast.error('Tham số callback không hợp lệ. Vui lòng thử lại.');
            router.replace('/login');
            return;
        }

        const stored = sessionStorage.getItem('oauth_state');
        if (!stored) {
            toast.error('Phiên đăng nhập OAuth đã hết hạn. Vui lòng thử lại.');
            router.replace('/login');
            return;
        }

        let savedState: string;
        let provider: string;
        try {
            ({ state: savedState, provider } = JSON.parse(stored) as {
                state: string;
                provider: string;
            });
        } catch {
            toast.error('Dữ liệu phiên OAuth không hợp lệ.');
            router.replace('/login');
            return;
        }

        // Xóa ngay sau khi đọc để tránh replay
        sessionStorage.removeItem('oauth_state');

        // Kiểm tra state CSRF
        if (savedState !== state) {
            toast.error('State OAuth không khớp. Vui lòng thử lại.');
            router.replace('/login');
            return;
        }

        authService
            .socialCallback(provider, { code, state })
            .then((res) => {
                dispatch(
                    setAuth({
                        accessToken: res.data.accessToken,
                        user: res.data.user,
                    }),
                );
                toast.success(`Đăng nhập bằng ${provider} thành công!`);
                router.replace('/');
            })
            .catch((err: unknown) => {
                toast.error(getErrorMessage(err));
                router.replace('/login');
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            <p className="text-sm text-zinc-500">Đang xử lý đăng nhập…</p>
        </div>
    );
}

export default function CallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
            }
        >
            <CallbackHandler />
        </Suspense>
    );
}
