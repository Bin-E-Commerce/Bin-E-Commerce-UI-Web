// Modal này trình bày toàn bộ ngữ cảnh của một yêu cầu hoàn hàng cho Seller.
// Component chỉ đọc snapshot request và order được truyền vào; thao tác duyệt, kiểm tra và tạo vận đơn vẫn thuộc màn hình danh sách.

'use client';

import { CalendarDays, CheckCircle2, Clock3, Package, X } from 'lucide-react';
import { useState } from 'react';

import {
    ImageLightbox,
    ImageLightboxThumbnail,
    type ImageLightboxMedia,
} from '@/common/reviews/components/ImageLightbox';
import type { OrderReturnResponse } from '@/services/order/order.api';
import type { SellerOrderResponse } from '@/services/order/seller-order.api';

interface SellerReturnDetailModalProps {
    request: OrderReturnResponse;
    order?: SellerOrderResponse;
    loading: boolean;
    error: boolean;
    onClose: () => void;
}

// Đổi mã lý do và trạng thái thành nhãn nghiệp vụ để Seller đọc detail mà không cần biết enum backend.
function getReturnLabel(value: string): string {
    const labels: Record<string, string> = {
        PENDING: 'Đang xử lý',
        CONFIRMED: 'Đã xác nhận',
        FAILED: 'Thất bại',
        CANCELLED: 'Đã hủy',
        TO_SHIP: 'Cần xử lý',
        SHIPPING: 'Đang vận chuyển',
        DELIVERED: 'Đã giao',
        COMPLETED: 'Hoàn thành',
        DELIVERY_FAILED: 'Giao thất bại',
        RETURN_REFUND: 'Trả hàng / hoàn tiền',
        DAMAGED: 'Sản phẩm bị hư hỏng',
        WRONG_ITEM: 'Giao sai sản phẩm',
        MISSING_ITEM: 'Thiếu sản phẩm',
        NOT_AS_DESCRIBED: 'Không đúng mô tả',
        CHANGE_OF_MIND: 'Đổi ý không muốn nhận',
        OTHER: 'Lý do khác',
        REQUESTED: 'Chờ shop duyệt',
        CUSTOMER_CANCELLED: 'Khách đã hủy yêu cầu',
        APPROVED: 'Đã duyệt',
        REJECTED: 'Đã từ chối',
        AWAITING_SHIPMENT: 'Chờ khách gửi hàng',
        IN_TRANSIT: 'Đang hoàn về shop',
        SHIPMENT_FAILED: 'Gửi hàng hoàn thất bại',
        RECEIVED: 'Chờ kiểm tra hàng',
        INSPECTION_FAILED: 'Kiểm tra không đạt · Chờ gửi trả sản phẩm',
        REFUND_PENDING: 'Đã kiểm tra đạt · Chờ hoàn tiền',
    };

    return labels[value] ?? value;
}

// Định dạng tiền và thời gian tại modal để mọi thông tin request dùng cùng một cách hiển thị.
function formatMoney(value: string | null | undefined): string {
    return `${Math.round(Number(value ?? 0)).toLocaleString('vi-VN')} đ`;
}

// Chuẩn hóa ngày ISO thành nhãn đọc nhanh theo múi giờ và locale của người dùng Việt Nam.
function formatDate(value: string | Date | null | undefined): string {
    if (!value) return 'Chưa cập nhật';
    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

// Lấy các phần địa chỉ có dữ liệu theo đúng thứ tự giao hàng, tránh hiển thị object kỹ thuật cho Seller.
function getAddressLines(address: Record<string, string>): string[] {
    return [
        address.fullName,
        address.phone,
        address.addressLine ?? address.street,
        address.ward,
        address.district,
        address.province,
    ].filter((value): value is string => Boolean(value?.trim()));
}

// Chuẩn hóa bằng chứng customer gửi thành media để Seller có thể xem bằng ImageLightbox dùng chung.
function getRequestMedia(request: OrderReturnResponse): ImageLightboxMedia[] {
    return (request.evidence ?? []).map((media, index) => ({
        url: media.url,
        type: media.type,
        label:
            media.type === 'video'
                ? `Video bằng chứng ${index + 1}`
                : `Ảnh bằng chứng ${index + 1}`,
    }));
}

// Render một dòng thông tin có nhãn để modal giữ thứ bậc thị giác rõ ràng trên desktop và mobile.
function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 py-3 last:border-b-0">
            <dt className="shrink-0 text-sm text-zinc-500">{label}</dt>
            <dd className="text-right text-sm font-medium text-zinc-950">
                {value}
            </dd>
        </div>
    );
}

// Hiển thị detail read-only của request; media được mở bằng ImageLightbox dùng chung của hệ thống.
export function SellerReturnDetailModal({
    request,
    order,
    loading,
    error,
    onClose,
}: SellerReturnDetailModalProps) {
    const [activeMedia, setActiveMedia] = useState<number | null>(null);
    const media = getRequestMedia(request);
    const selectedItems =
        order?.items.filter((item) => request.itemIds.includes(item.id)) ?? [];
    const addressLines = order ? getAddressLines(order.shippingAddress) : [];
    const productRefundAmount =
        Number(request.refundItemAmount ?? 0) ||
        selectedItems.reduce(
            (total, item) => total + Number(item.lineTotal),
            0,
        );
    const shippingRefundAmount = Number(request.refundShippingAmount ?? 0);
    const returnShippingCost = Number(request.returnShippingCost ?? 0);
    const customerReturnShippingFee = Number(request.returnShippingFee ?? 0);
    const totalRefundAmount =
        productRefundAmount + shippingRefundAmount - customerReturnShippingFee;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/35 p-3 backdrop-blur-sm sm:p-6"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="seller-return-detail-title"
                className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl"
            >
                <header className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-5 sm:px-7">
                    <div className="min-w-0">
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <h2
                                id="seller-return-detail-title"
                                className="text-xl font-bold tracking-tight text-zinc-950"
                            >
                                Yêu cầu #{request.id.slice(0, 8)}
                            </h2>
                            <span className="rounded-full bg-zinc-950 px-2.5 py-1 text-xs font-semibold text-white">
                                {getReturnLabel(request.status)}
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">
                            Đơn hàng{' '}
                            {order?.orderNumber ??
                                `#${request.orderId.slice(0, 8)}`}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng chi tiết yêu cầu hoàn hàng"
                        className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-zinc-950 hover:text-white"
                    >
                        <X className="size-4" />
                    </button>
                </header>

                <div className="min-h-0 overflow-y-auto p-5 sm:p-7">
                    {loading ? (
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-10 text-center text-sm text-zinc-500">
                            Đang tải thông tin sản phẩm và đơn hàng...
                        </div>
                    ) : error || !order ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-5 text-sm text-red-700">
                            Không thể tải đầy đủ thông tin đơn hàng. Vui lòng
                            đóng cửa sổ và thử lại.
                        </div>
                    ) : (
                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)]">
                            <div className="space-y-5">
                                <section className="rounded-2xl border border-zinc-200 bg-white p-5">
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
                                            <Package className="size-5" />
                                        </span>
                                        <div>
                                            <h3 className="font-semibold text-zinc-950">
                                                Thông tin yêu cầu
                                            </h3>
                                            <p className="mt-0.5 text-xs text-zinc-500">
                                                Nội dung Seller cần kiểm tra
                                                trước khi xử lý
                                            </p>
                                        </div>
                                    </div>
                                    <dl className="mt-4">
                                        <DetailRow
                                            label="Mã yêu cầu"
                                            value={request.id}
                                        />
                                        <DetailRow
                                            label="Lý do hoàn"
                                            value={getReturnLabel(
                                                request.reason,
                                            )}
                                        />
                                        <DetailRow
                                            label="Hoàn tiền sản phẩm"
                                            value={formatMoney(
                                                String(productRefundAmount),
                                            )}
                                        />
                                        <DetailRow
                                            label="Hoàn phí vận chuyển"
                                            value={formatMoney(
                                                String(shippingRefundAmount),
                                            )}
                                        />
                                        <DetailRow
                                            label="Chi phí gửi hàng hoàn (GHN)"
                                            value={formatMoney(
                                                String(returnShippingCost),
                                            )}
                                        />
                                        <DetailRow
                                            label="Phí hoàn khách chịu"
                                            value={formatMoney(
                                                String(
                                                    customerReturnShippingFee,
                                                ),
                                            )}
                                        />
                                        <div className="mt-1 flex items-start justify-between gap-4 border-t border-zinc-200 pt-4">
                                            <dt className="text-sm font-semibold text-zinc-700">
                                                Tổng tiền hoàn
                                            </dt>
                                            <dd className="text-right text-base font-bold text-zinc-950">
                                                {formatMoney(
                                                    String(totalRefundAmount),
                                                )}
                                            </dd>
                                        </div>
                                        <DetailRow
                                            label="Tạo lúc"
                                            value={formatDate(
                                                request.requestedAt ??
                                                    request.createdAt,
                                            )}
                                        />
                                        <DetailRow
                                            label="Cập nhật lúc"
                                            value={formatDate(
                                                request.updatedAt,
                                            )}
                                        />
                                    </dl>
                                    {request.description ? (
                                        <div className="mt-4 rounded-xl bg-zinc-50 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                                                Mô tả của khách hàng
                                            </p>
                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                                                {request.description}
                                            </p>
                                        </div>
                                    ) : null}
                                    {request.reviewNote ? (
                                        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                                                Ghi chú xử lý
                                            </p>
                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-amber-900">
                                                {request.reviewNote}
                                            </p>
                                        </div>
                                    ) : null}
                                </section>

                                <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-semibold text-zinc-950">
                                                Bảng tính tiền hoàn
                                            </h3>
                                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                                                Công thức minh bạch để đối soát
                                                từng khoản tiền.
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-zinc-600">
                                            VND
                                        </span>
                                    </div>
                                    <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white">
                                        <table className="w-full text-sm">
                                            <thead className="bg-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold">
                                                        Khoản tiền
                                                    </th>
                                                    <th className="px-4 py-3 text-right font-semibold">
                                                        Giá trị
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100">
                                                <tr>
                                                    <td className="px-4 py-3 text-zinc-600">
                                                        Sản phẩm được chọn hoàn
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium text-zinc-950">
                                                        {formatMoney(
                                                            String(
                                                                productRefundAmount,
                                                            ),
                                                        )}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3 text-zinc-600">
                                                        Phí vận chuyển được hoàn
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium text-zinc-950">
                                                        +{' '}
                                                        {formatMoney(
                                                            String(
                                                                shippingRefundAmount,
                                                            ),
                                                        )}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3 text-zinc-600">
                                                        Chi phí gửi hàng hoàn
                                                        (GHN)
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium text-zinc-950">
                                                        {formatMoney(
                                                            String(
                                                                returnShippingCost,
                                                            ),
                                                        )}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3 text-zinc-600">
                                                        Phí hoàn khách chịu
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium text-zinc-950">
                                                        −{' '}
                                                        {formatMoney(
                                                            String(
                                                                customerReturnShippingFee,
                                                            ),
                                                        )}
                                                    </td>
                                                </tr>
                                            </tbody>
                                            <tfoot className="border-t border-zinc-200 bg-zinc-50">
                                                <tr>
                                                    <td className="px-4 py-3 font-semibold text-zinc-950">
                                                        Tổng tiền hoàn
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-zinc-950">
                                                        {formatMoney(
                                                            String(
                                                                totalRefundAmount,
                                                            ),
                                                        )}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                    <p className="mt-3 rounded-lg bg-white px-3 py-2 text-xs leading-5 text-zinc-500">
                                        Công thức: tiền sản phẩm + phí ship
                                        chiều đi được hoàn − phí hoàn khách
                                        chịu. Chi phí GHN chiều ngược là số thực
                                        tế của vận đơn customer → shop; nếu lỗi
                                        thuộc shop thì khách không bị khấu trừ
                                        khoản này.
                                    </p>
                                </section>

                                <section className="rounded-2xl border border-zinc-200 bg-white p-5">
                                    <h3 className="font-semibold text-zinc-950">
                                        Kiểm tra hàng hoàn
                                    </h3>
                                    <dl className="mt-3">
                                        <DetailRow
                                            label="Kết quả kiểm tra"
                                            value={
                                                request.inspectionPassed ===
                                                null
                                                    ? 'Chưa kiểm tra'
                                                    : request.inspectionPassed
                                                      ? 'Đạt kiểm tra'
                                                      : 'Không đạt kiểm tra'
                                            }
                                        />
                                        <DetailRow
                                            label="Ghi chú kiểm tra"
                                            value={
                                                request.inspectionNote ||
                                                'Chưa có'
                                            }
                                        />
                                        <DetailRow
                                            label="Kiểm tra lúc"
                                            value={formatDate(
                                                request.inspectedAt,
                                            )}
                                        />
                                    </dl>
                                </section>

                                <section className="rounded-2xl border border-zinc-200 bg-white p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-zinc-950">
                                                Sản phẩm trong yêu cầu
                                            </h3>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                {selectedItems.length} sản phẩm
                                                được chọn hoàn
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
                                            Đơn {order.orderNumber}
                                        </span>
                                    </div>
                                    <div className="mt-4 divide-y divide-zinc-100">
                                        {selectedItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex gap-3 py-4 first:pt-0 last:pb-0"
                                            >
                                                <div className="size-16 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                                                    {item.imageUrl ? (
                                                        // Ảnh sản phẩm là snapshot từ Order Service nên cần giữ nguyên URL lịch sử.
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={
                                                                item.productName
                                                            }
                                                            className="size-full object-cover"
                                                        />
                                                    ) : (
                                                        <Package className="m-5 size-6 text-zinc-400" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-zinc-950">
                                                        {item.productName}
                                                    </p>
                                                    <p className="mt-1 text-sm text-zinc-500">
                                                        Phân loại:{' '}
                                                        {item.variantName ||
                                                            'Mặc định'}
                                                    </p>
                                                    <p className="mt-1 text-xs text-zinc-400">
                                                        Mã sản phẩm:{' '}
                                                        {item.productId} · Số
                                                        lượng: {item.quantity}
                                                    </p>
                                                </div>
                                                <p className="shrink-0 text-right text-sm font-semibold text-zinc-950">
                                                    {formatMoney(
                                                        item.lineTotal,
                                                    )}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {media.length > 0 ? (
                                    <section className="rounded-2xl border border-zinc-200 bg-white p-5">
                                        <div>
                                            <h3 className="font-semibold text-zinc-950">
                                                Bằng chứng và chứng từ
                                            </h3>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                Bấm vào ảnh hoặc video để xem
                                                kích thước lớn.
                                            </p>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            {media.map((entry, index) => (
                                                <ImageLightboxThumbnail
                                                    key={`${entry.url}-${index}`}
                                                    item={entry}
                                                    onClick={() =>
                                                        setActiveMedia(index)
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </section>
                                ) : (
                                    <section className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm text-zinc-500">
                                        Yêu cầu này chưa có ảnh, video hoặc
                                        chứng từ đính kèm.
                                    </section>
                                )}
                            </div>

                            <aside className="space-y-5">
                                <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                                    <h3 className="font-semibold text-zinc-950">
                                        Đơn hàng gốc
                                    </h3>
                                    <dl className="mt-3">
                                        <DetailRow
                                            label="Mã đơn"
                                            value={order.orderNumber}
                                        />
                                        <DetailRow
                                            label="Trạng thái đơn"
                                            value={getReturnLabel(
                                                order.fulfillmentStatus ??
                                                    order.status,
                                            )}
                                        />
                                        <DetailRow
                                            label="Thanh toán"
                                            value={
                                                order.paymentMethod === 'COD'
                                                    ? 'Thanh toán khi nhận hàng'
                                                    : order.paymentMethod
                                            }
                                        />
                                        <DetailRow
                                            label="Doanh thu shop"
                                            value={formatMoney(
                                                order.shopItemTotal,
                                            )}
                                        />
                                        <DetailRow
                                            label="Đặt lúc"
                                            value={formatDate(order.createdAt)}
                                        />
                                    </dl>
                                </section>

                                <section className="rounded-2xl border border-zinc-200 bg-white p-5">
                                    <h3 className="font-semibold text-zinc-950">
                                        Thông tin nhận hàng
                                    </h3>
                                    <div className="mt-3 rounded-xl bg-zinc-50 p-4">
                                        {addressLines.map((line) => (
                                            <p
                                                key={line}
                                                className="text-sm leading-6 text-zinc-700"
                                            >
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                </section>

                                <section className="rounded-2xl border border-zinc-200 bg-white p-5">
                                    <h3 className="font-semibold text-zinc-950">
                                        Lịch sử đơn hàng
                                    </h3>
                                    <div className="mt-4 space-y-4">
                                        {order.statusHistory.length > 0 ? (
                                            order.statusHistory.map(
                                                (history) => (
                                                    <div
                                                        key={history.id}
                                                        className="relative pl-7"
                                                    >
                                                        <span className="absolute left-0 top-0.5 flex size-5 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
                                                            <CheckCircle2 className="size-3" />
                                                        </span>
                                                        <p className="text-sm font-medium text-zinc-950">
                                                            {getReturnLabel(
                                                                history.toStatus,
                                                            )}
                                                        </p>
                                                        <p className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
                                                            <Clock3 className="size-3" />{' '}
                                                            {formatDate(
                                                                history.createdAt,
                                                            )}
                                                        </p>
                                                    </div>
                                                ),
                                            )
                                        ) : (
                                            <p className="text-sm text-zinc-500">
                                                Chưa có lịch sử cập nhật.
                                            </p>
                                        )}
                                    </div>
                                </section>

                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                    <CalendarDays className="size-3.5" />
                                    Yêu cầu được tạo{' '}
                                    {formatDate(request.createdAt)}
                                </div>
                            </aside>
                        </div>
                    )}
                </div>
            </section>

            {activeMedia !== null ? (
                <ImageLightbox
                    media={media}
                    initialIndex={activeMedia}
                    title="Bằng chứng hoàn hàng"
                    altPrefix="Bằng chứng"
                    onClose={() => setActiveMedia(null)}
                />
            ) : null}
        </div>
    );
}
