// Route Handler nhận callback Pay2S HTTPS và chuyển thẳng về origin localhost.
// Handler không xác minh hay cập nhật trạng thái thanh toán; backend trên localhost vẫn xác minh chữ ký.
import { NextRequest, NextResponse } from 'next/server';

// Chuyển GET callback sang trang local có phiên đăng nhập và giữ nguyên các trường Pay2S để backend kiểm tra.
// Flow chỉ chọn một trong hai path cố định; không dùng URL đích do request cung cấp để tránh open redirect.
export function GET(request: NextRequest): NextResponse {
    const callbackParams = new URLSearchParams(
        request.nextUrl.searchParams,
    );
    const destination =
        callbackParams.get('flow') === 'wallet'
            ? '/seller/finance/pay2s-return'
            : '/profile/orders';

    // Xóa cờ nội bộ trước khi chuyển tiếp để DTO/backend chỉ nhận dữ liệu Pay2S.
    callbackParams.delete('flow');

    const localUrl = new URL(destination, 'http://localhost:5173');
    const callbackQuery = callbackParams.toString();
    if (callbackQuery) localUrl.search = callbackQuery;

    // Dùng redirect server-side để không phụ thuộc React hydration trên host ngrok.
    return NextResponse.redirect(localUrl, 307);
}
