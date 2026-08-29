// Hook này gom quy tắc bảo vệ các thao tác cart trên frontend.
// Hook không xác thực token; nó chỉ đọc auth state và tạo URL login có redirect an toàn nội bộ.

'use client';

import { useRouter } from 'next/navigation';

import { useAppSelector } from '@/store/hooks';

// Tạo URL đăng nhập kèm đường dẫn nội bộ để người dùng quay lại đúng nơi vừa thao tác.
function buildLoginHref(returnPath: string): string {
    return `/login?redirect=${encodeURIComponent(returnPath)}`;
}

// Cung cấp trạng thái đăng nhập và các hàm điều hướng dùng chung cho icon cart và CTA sản phẩm.
export function useCartAuthRedirect() {
    const router = useRouter();
    const { initialized, accessToken, user } = useAppSelector(
        (state) => state.auth,
    );
    const isAuthenticated = Boolean(
        initialized && accessToken && user?.id,
    );

    // Chỉ quyết định đưa Guest sang login sau khi auth hydrate xong; trong lúc chờ, giữ route để tránh redirect sai khi refresh.
    function getProtectedHref(returnPath: string): string {
        if (!initialized) return returnPath;
        return isAuthenticated ? returnPath : buildLoginHref(returnPath);
    }

    // Chuyển Guest tới login sau khi đã xác nhận không có session, không can thiệp vào giai đoạn restore ban đầu.
    function redirectToLogin(returnPath: string): void {
        if (initialized && !isAuthenticated) {
            router.push(buildLoginHref(returnPath));
        }
    }

    return { initialized, isAuthenticated, getProtectedHref, redirectToLogin };
}
