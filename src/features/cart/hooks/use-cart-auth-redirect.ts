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

    // Trả href bảo vệ route cart; Guest sẽ được đưa qua login thay vì mở cart trực tiếp.
    function getProtectedHref(returnPath: string): string {
        return isAuthenticated ? returnPath : buildLoginHref(returnPath);
    }

    // Chuyển Guest tới login và giữ lại trang hiện tại để không làm mất ngữ cảnh mua hàng.
    function redirectToLogin(returnPath: string): void {
        if (!isAuthenticated) {
            router.push(buildLoginHref(returnPath));
        }
    }

    return { isAuthenticated, getProtectedHref, redirectToLogin };
}
