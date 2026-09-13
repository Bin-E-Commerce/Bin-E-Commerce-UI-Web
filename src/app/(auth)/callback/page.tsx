// Trang hoàn tất OAuth sau khi nhà cung cấp chuyển trình duyệt về ứng dụng.
// Trang xác minh state, trao đổi authorization code và khôi phục phiên recommendation;
// không sở hữu quy trình cấp token của backend và phải giữ nguyên lớp chống CSRF.
'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AppDispatch } from '@/store';
import { setAuth } from '@/store/slices/authSlice';
import { authService } from '@/services/auth';
import { mergeRecommendationSession } from '@/services/recommendation';
import { getDefaultAuthenticatedPath } from '@/services/auth/access';
import { getErrorMessage } from '@/utils/getErrorMessage';

// Xử lý callback một lần, xác minh state lưu trong sessionStorage rồi mới gửi code lên backend.
// Lỗi đã có sẵn từ query được suy ra trực tiếp khi render; lỗi kiểm tra browser/API cập nhật qua Promise.
// Nhờ vậy effect không gọi setState đồng bộ và authorization code vẫn chỉ được dùng sau khi qua kiểm tra CSRF.
function CallbackHandler() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const params = useSearchParams();
    const callbackQuery = params.toString();
    const oauthError = params.get('error');
    const oauthErrorMessage = oauthError
        ? `Đăng nhập thất bại: ${params.get('error_description') ?? oauthError}`
        : null;
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const called = useRef(false); // Tránh React strict-mode gọi 2 lần

    useEffect(() => {
        if (called.current) return;
        called.current = true;

        // Keycloak trả lỗi qua URL; nội dung lỗi đã được render từ query nên effect chỉ cần dừng.
        if (oauthError) {
            return;
        }

        const callbackParams = new URLSearchParams(callbackQuery);
        const code = callbackParams.get('code');
        const state = callbackParams.get('state');

        // Browser storage được đọc trong nhánh Promise; các lỗi validation vì thế cập nhật UI bất đồng bộ,
        // còn code chỉ được gửi tới backend sau khi state lưu cục bộ khớp với state từ nhà cung cấp.
        void Promise.resolve()
            .then(() => {
                if (!code || !state) {
                    throw new Error(
                        'Tham số callback không hợp lệ. Vui lòng thử lại.',
                    );
                }

                const stored = sessionStorage.getItem('oauth_state');
                if (!stored) {
                    throw new Error(
                        'Phiên đăng nhập OAuth đã hết hạn. Vui lòng thử lại.',
                    );
                }

                let savedSession: { state: string; provider: string };
                try {
                    savedSession = JSON.parse(stored) as {
                        state: string;
                        provider: string;
                    };
                } catch {
                    throw new Error('Dữ liệu phiên OAuth không hợp lệ.');
                }

                // Xóa state ngay khi đã đọc để tránh callback bị phát lại trong cùng phiên trình duyệt.
                sessionStorage.removeItem('oauth_state');

                // So khớp state trước khi gửi authorization code để chặn callback giả mạo kiểu CSRF.
                if (savedSession.state !== state) {
                    throw new Error(
                        'State OAuth không khớp. Có thể là tấn công CSRF.',
                    );
                }

                return authService.socialCallback(savedSession.provider, {
                    code,
                    state,
                });
            })
            .then(async (res) => {
                dispatch(
                    setAuth({
                        accessToken: res.data.accessToken,
                        user: res.data.user,
                    }),
                );
                // OAuth callback không luôn remount StoreProvider nên phải merge ngay tại đây.
                await mergeRecommendationSession().catch(() => undefined);
                router.replace(getDefaultAuthenticatedPath(res.data.user));
            })
            .catch((err: unknown) => {
                setErrorMsg(getErrorMessage(err));
            });
    }, [callbackQuery, dispatch, oauthError, router]);

    const displayedError = oauthErrorMessage ?? errorMsg;

    if (displayedError) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
                <p className="text-sm text-red-600">{displayedError}</p>
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
