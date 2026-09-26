// Trang hoàn tất OAuth sau khi nhà cung cấp chuyển trình duyệt về ứng dụng.
// Trang xác minh state, trao đổi authorization code và khôi phục phiên recommendation;
// không sở hữu quy trình cấp token của backend và phải giữ nguyên lớp chống CSRF.
'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Loader2, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AppDispatch } from '@/store';
import { setAuth } from '@/store/slices/authSlice';
import { authService } from '@/services/auth';
import { mergeRecommendationSession } from '@/services/recommendation';
import { getDefaultAuthenticatedPath } from '@/services/auth/access';
import { getErrorMessage } from '@/utils/getErrorMessage';

// Nhận diện lỗi khóa tài khoản từ cả backend và Keycloak để callback không hiển thị thông báo kỹ thuật.
function isBlockedAccountError(message: string): boolean {
    const normalizedMessage = message.toLowerCase();
    return (
        normalizedMessage.includes('account is disabled') ||
        normalizedMessage.includes('account is banned') ||
        normalizedMessage.includes('tài khoản đã bị khóa') ||
        normalizedMessage.includes('tài khoản đã bị vô hiệu hóa')
    );
}

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
                        sessionId: res.data.sessionId,
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
    const isBannedAccount = displayedError
        ? isBlockedAccountError(displayedError)
        : false;

    if (displayedError) {
        return (
            <div className="callback-page-shell flex w-full items-center justify-center bg-zinc-50 px-6 py-10">
                <div className="flex w-full max-w-[560px] flex-col items-center rounded-2xl border border-zinc-200 bg-white p-7 text-center shadow-sm sm:p-9">
                    {isBannedAccount ? (
                        <>
                            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-950 text-white shadow-sm">
                                <ShieldX className="h-7 w-7" />
                            </span>
                            <h1 className="mt-5 text-xl font-semibold text-zinc-950">
                                Tài khoản đã bị khóa
                            </h1>
                            <p className="mt-3 max-w-[440px] text-sm leading-6 text-zinc-600">
                                Tài khoản của bạn đang ở trạng thái{' '}
                                <strong className="font-semibold text-zinc-900">
                                    BANNED
                                </strong>{' '}
                                và{' '}
                                <strong className="font-semibold text-zinc-900">
                                    không thể đăng nhập
                                </strong>{' '}
                                vào hệ thống.
                            </p>
                            <div className="mt-6 w-full space-y-3 text-left">
                                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                                    <p className="text-sm font-semibold text-zinc-950">
                                        Lý do bị BANNED
                                    </p>
                                    <p className="mt-1.5 text-sm leading-6 text-zinc-600">
                                        Tài khoản bị quản trị viên khóa để bảo
                                        vệ nền tảng hoặc xử lý một vấn đề cần
                                        xem xét. Liên hệ Support để biết thêm lý
                                        do cụ thể.
                                    </p>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-4">
                                    <p className="text-sm font-semibold text-zinc-950">
                                        Làm thế nào để yêu cầu gỡ khóa?
                                    </p>
                                    <p className="mt-1.5 text-sm leading-6 text-zinc-600">
                                        Liên hệ{' '}
                                        <strong className="font-semibold text-zinc-900">
                                            quản trị viên hoặc Support
                                        </strong>{' '}
                                        qua kênh hỗ trợ chính thức. Hãy cung cấp{' '}
                                        <strong className="font-semibold text-zinc-900">
                                            email đăng ký
                                        </strong>{' '}
                                        và yêu cầu xem xét. Việc mở lại chỉ được
                                        thực hiện sau khi{' '}
                                        <strong className="font-semibold text-zinc-900">
                                            được phê duyệt
                                        </strong>{' '}
                                        bởi quản trị viên.
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h1 className="text-xl font-semibold text-zinc-950">
                                Không thể đăng nhập
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-red-600">
                                {displayedError}
                            </p>
                        </>
                    )}
                    <Button
                        className="mt-7 w-full max-w-[338px]"
                        onClick={() => router.push('/login')}
                    >
                        Quay lại đăng nhập
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col items-center justify-center gap-3 py-10">
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
                <div className="flex w-full items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
            }
        >
            <CallbackHandler />
        </Suspense>
    );
}
