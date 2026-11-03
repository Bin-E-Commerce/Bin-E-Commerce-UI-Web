// Route Handler nhận callback Pay2S và trả về origin web đã cấu hình cho môi trường hiện tại.
// Handler không xác minh hay cập nhật trạng thái thanh toán; Order Service vẫn xác minh giao dịch.
import { NextRequest, NextResponse } from 'next/server';
import { SITE_URL } from '@/config/site.config';

// Chọn một trong hai path cố định và dùng SITE_URL tin cậy thay vì origin nội bộ do proxy có thể ghi đè.
// Giữ query Pay2S đã ký để trang đích xác minh với Order Service; cờ flow nội bộ không được chuyển tiếp.
export function GET(request: NextRequest): NextResponse {
    const callbackParams = new URLSearchParams(request.nextUrl.searchParams);
    const destination =
        callbackParams.get('flow') === 'wallet'
            ? '/seller/finance/pay2s-return'
            : '/profile/orders';

    // Xóa cờ nội bộ trước khi chuyển tiếp để DTO/backend chỉ nhận dữ liệu Pay2S.
    callbackParams.delete('flow');

    // URL từ biến cấu hình giữ HTTP localhost ở dev và domain HTTPS chính thức ở production.
    const callbackUrl = new URL(destination, SITE_URL);
    const callbackQuery = callbackParams.toString();
    if (callbackQuery) callbackUrl.search = callbackQuery;

    // Redirect server-side để không phụ thuộc React hydration trên host nhận callback.
    return NextResponse.redirect(callbackUrl, 307);
}
