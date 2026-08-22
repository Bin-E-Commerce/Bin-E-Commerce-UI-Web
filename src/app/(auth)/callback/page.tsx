'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AppDispatch } from '@/store';
import { setAuth } from '@/store/slices/authSlice';
import { authService } from '@/services/auth';
import { getErrorMessage } from '@/utils/getErrorMessage';

// ─── Inner component (cần useSearchParams nên phải wrap Suspense) ────────────
function CallbackHandler() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const params = useSearchParams();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const called = useRef(false); // Tránh React strict-mode gọi 2 lần

    useEffect(() => {
        if (called.current) return;
        called.current = true;

        const code = params.get('code');
        const state = params.get('state');

        // Keycloak có thể redirect với error param (user từ chối quyền, v.v.)
        const oauthError = params.get('error');
        if (oauthError) {
            setErrorMsg(
                `Đăng nhập thất bại: ${params.get('error_description') ?? oauthError}`,
            );
            return;
        }

        if (!code || !state) {
            setErrorMsg('Tham số callback không hợp lệ. Vui lòng thử lại.');
            return;
        }

        // Đọc state + provider đã lưu trước khi redirect sang Keycloak
        const stored = sessionStorage.getItem('oauth_state');
        if (!stored) {
            setErrorMsg('Phiên đăng nhập OAuth đã hết hạn. Vui lòng thử lại.');
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
            setErrorMsg('Dữ liệu phiên OAuth không hợp lệ.');
            return;
        }

        // Xóa ngay sau khi đọc để tránh replay
        sessionStorage.removeItem('oauth_state');

        // Kiểm tra state khớp — đây là lớp bảo vệ CSRF thứ hai (server đã kiểm tra một lần nữa)
        if (savedState !== state) {
            setErrorMsg('State OAuth không khớp. Có thể là tấn công CSRF.');
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
                router.replace('/');
            })
            .catch((err: unknown) => {
                setErrorMsg(getErrorMessage(err));
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (errorMsg) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
                <p className="text-sm text-red-600">{errorMsg}</p>
                <Button variant="outline" onClick={() => router.push('/login')}>
                    Quay lại đăng nhập
                </Button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            <p className="text-sm text-zinc-500">Đang xử lý đăng nhập…</p>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
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
