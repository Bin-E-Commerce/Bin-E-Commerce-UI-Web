// Hiển thị snapshot đơn thuộc shop hiện tại; mọi mã đơn, sản phẩm, ảnh và số tiền đều do Order Service cấp.
'use client';

import {
    formatInsightNumber,
    SellerProductThumbnail,
} from '../shared/insight-card.primitives';
import type { ExtractSellerCopilotOrders } from '../../../../types/answer/insight.types';
import type { SellerCopilotOrderInsight } from '@/services/seller/types/seller-copilot-insight.types';

const ORDER_STATUS_LABELS: Record<string, string> = {
    PENDING: 'Chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    FAILED: 'Thất bại',
    CANCELLED: 'Đã hủy',
};

const FULFILLMENT_STATUS_LABELS: Record<string, string> = {
    TO_SHIP: 'Chờ giao hàng',
    SHIPPING: 'Đang giao',
    DELIVERED: 'Đã giao',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    DELIVERY_FAILED: 'Giao hàng thất bại',
    RETURN_REFUND: 'Đang hoàn trả',
};

const RETURN_REASON_LABELS: Record<string, string> = {
    DAMAGED: 'Sản phẩm bị hư hỏng',
    WRONG_ITEM: 'Nhận sai sản phẩm',
    MISSING_ITEM: 'Thiếu sản phẩm trong đơn',
    NOT_AS_DESCRIBED: 'Sản phẩm không đúng mô tả',
    CHANGE_OF_MIND: 'Khách đổi ý',
    OTHER: 'Lý do khác',
};

const ORDER_DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
});

// Định dạng ngày tạo theo lịch Việt Nam; timestamp lỗi được thay bằng gạch ngang để không lộ chuỗi kỹ thuật.
function formatOrderDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? '—'
        : ORDER_DATE_FORMATTER.format(date);
}

// Tên trạng thái lấy từ allowlist giao diện; giá trị lạ không hiện enum thô từ API.
function getOrderStatusLabel(
    value: string,
    labels: Record<string, string>,
): string {
    return labels[value] ?? 'Đang cập nhật';
}

// Một item giữ đúng ảnh/tên/giá snapshot lúc đặt hàng và fallback ảnh khi URL trống hoặc tải lỗi.
function OrderItemRow({
    item,
}: {
    item: SellerCopilotOrderInsight['items'][number];
}) {
    return (
        <div className="flex min-w-0 items-center gap-3 py-2">
            <SellerProductThumbnail
                name={item.name}
                thumbnailUrl={item.thumbnailUrl}
            />
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900">
                    {item.name}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                    Số lượng: {formatInsightNumber(item.quantity)}
                </p>
            </div>
            <p className="shrink-0 text-sm font-medium text-zinc-700">
                {formatInsightNumber(item.lineTotal)} ₫
            </p>
        </div>
    );
}

// Tóm tắt đơn và mặt hàng trong bố cục gọn; danh sách hoàn trả lấy riêng để không bị lẫn với các đơn mới.
export function SellerCopilotOrderDetailsCard({
    insight,
}: {
    insight: ExtractSellerCopilotOrders;
}) {
    const isReturnList = insight.type === 'RETURN_ORDERS';
    const isActionableList = insight.type === 'ACTIONABLE_ORDERS';
    const isCancelledList = insight.type === 'CANCELLED_ORDERS';
    const isDeliveredList = insight.type === 'DELIVERED_ORDERS';
    const isCompletedList = insight.type === 'COMPLETED_ORDERS';
    const title = isReturnList
        ? 'Đơn hàng hoàn trả'
        : isActionableList
          ? 'Đơn cần shop xử lý'
          : isCancelledList
            ? 'Đơn hàng đã hủy'
            : isDeliveredList
              ? 'Đơn hàng đã giao'
              : isCompletedList
                ? 'Đơn hàng hoàn thành'
                : 'Thông tin đơn hàng';

    return (
        <section
            className="rounded-xl border border-zinc-200 bg-white p-4"
            aria-label={title}
        >
            <header className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600">
                    {insight.orders.length} đơn
                </span>
            </header>
            <div className="grid gap-3 sm:grid-cols-2">
                {insight.orders.map((order) => {
                    // Chỉ trạng thái hoàn trả dùng đỏ outline để nổi bật việc cần theo dõi; trạng thái khác giữ trung tính.
                    const isReturnRefund =
                        order.fulfillmentStatus === 'RETURN_REFUND';
                    const isCancelled =
                        order.status === 'CANCELLED' ||
                        order.fulfillmentStatus === 'CANCELLED';

                    return (
                        <article
                            key={order.id}
                            className="min-w-0 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-zinc-950">
                                        {order.orderNumber}
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        {formatOrderDate(order.createdAt)}
                                    </p>
                                </div>
                                <span
                                    className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-medium ${
                                        isReturnRefund || isCancelled
                                            ? 'border-red-300 bg-red-50 text-red-700'
                                            : 'border-zinc-200 bg-white text-zinc-700'
                                    }`}
                                >
                                    {getOrderStatusLabel(
                                        order.fulfillmentStatus,
                                        FULFILLMENT_STATUS_LABELS,
                                    )}
                                </span>
                            </div>
                            <div className="my-2 divide-y divide-zinc-200/80 border-y border-zinc-200/80">
                                {order.items.map((item, index) => (
                                    <OrderItemRow
                                        key={`${order.id}-${item.productId}-${index}`}
                                        item={item}
                                    />
                                ))}
                                {!order.items.length ? (
                                    <p className="py-3 text-xs text-zinc-500">
                                        Chưa có thông tin sản phẩm trong dữ liệu
                                        đơn.
                                    </p>
                                ) : null}
                            </div>
                            {isReturnRefund && order.returnReason ? (
                                <div className="mb-2 rounded-lg border border-red-100 bg-red-50/60 px-3 py-2">
                                    <p className="text-[11px] font-medium text-red-800">
                                        Lý do hoàn trả
                                    </p>
                                    <p className="mt-0.5 text-xs text-zinc-700">
                                        {RETURN_REASON_LABELS[
                                            order.returnReason
                                        ] ?? 'Lý do khác'}
                                        {order.returnDescription
                                            ? ` — ${order.returnDescription}`
                                            : ''}
                                    </p>
                                </div>
                            ) : null}
                            {isCancelled ? (
                                <div className="mb-2 rounded-lg border border-red-100 bg-red-50/60 px-3 py-2">
                                    <p className="text-[11px] font-medium text-red-800">
                                        Lý do hủy
                                    </p>
                                    <p className="mt-0.5 text-xs text-zinc-700">
                                        {order.cancelReason ||
                                            'Chưa có thông tin lý do hủy trong dữ liệu đơn.'}
                                    </p>
                                </div>
                            ) : null}
                            <footer className="flex items-center justify-between gap-2 text-xs">
                                <span className="text-zinc-500">
                                    {getOrderStatusLabel(
                                        order.status,
                                        ORDER_STATUS_LABELS,
                                    )}
                                    {' · '}
                                    {formatInsightNumber(order.itemCount)} sản
                                    phẩm
                                    {order.itemLineCount > order.items.length
                                        ? ` · Còn ${order.itemLineCount - order.items.length} mặt hàng`
                                        : ''}
                                </span>
                                <span className="shrink-0 font-semibold text-zinc-950">
                                    {formatInsightNumber(order.grossAmount)} ₫
                                </span>
                            </footer>
                        </article>
                    );
                })}
            </div>
            {insight.hasMore ? (
                <p className="mt-3 text-xs text-zinc-500">
                    Đang hiển thị một phần kết quả ưu tiên; còn đơn khác trong
                    danh sách.
                </p>
            ) : null}
        </section>
    );
}
