// Route Handler nhận callback Pay2S và điều hướng về trang phù hợp trên cùng origin.
// Handler không xác minh hay cập nhật trạng thái thanh toán; Order Service vẫn xác minh giao dịch.
import { NextRequest, NextResponse } from 'next/server';

// Chuyển callback sang trang đơn hàng hoặc ví shop, giữ query để trang đích yêu cầu backend xác minh.
// Flow chỉ chọn một trong hai path cố định; không dùng URL đích do query cung cấp để tránh open redirect.
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

    // Dùng origin đang nhận callback để production quay về domain web và tunnel local vẫn giữ đúng host.
    const callbackUrl = new URL(destination, request.nextUrl.origin);
    const callbackQuery = callbackParams.toString();
    if (callbackQuery) callbackUrl.search = callbackQuery;

    // Redirect server-side để không phụ thuộc React hydration trên host nhận callback.
    return NextResponse.redirect(callbackUrl, 307);
}
