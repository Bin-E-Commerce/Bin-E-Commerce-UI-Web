// Thẻ hiển thị phí giao hàng theo trạng thái quote, không tự tính hoặc thay đổi dữ liệu từ backend.

import {
    CircleAlert,
    Clock3,
    Info,
    Loader2,
    MapPinned,
    RefreshCw,
    ShieldCheck,
    Truck,
} from 'lucide-react';

interface ShippingFeeBreakdownItem {
    shopId: string;
    provider: string;
    fee: string;
    serviceName: string;
}

interface CheckoutShippingQuoteNoticeProps {
    isPending: boolean;
    isError: boolean;
    isAddressResolving?: boolean;
    mappingRequired?: boolean;
    shippingFee?: string;
    shippingFeeBreakdown?: ShippingFeeBreakdownItem[];
    onRetry: () => void;
}

// Định dạng phí breakdown theo cùng chuẩn tiền tệ với tổng thanh toán.
function formatPrice(value: string): string {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return '0 ₫';
    }

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

// Chọn trạng thái hiển thị theo thứ tự loading, thiếu địa chỉ, lỗi rồi mới tới kết quả thành công.
export function CheckoutShippingQuoteNotice({
    isPending,
    isError,
    isAddressResolving = false,
    mappingRequired = false,
    shippingFee,
    shippingFeeBreakdown = [],
    onRetry,
}: CheckoutShippingQuoteNoticeProps) {
    if (isAddressResolving || isPending) {
        return (
            <section
                role="status"
                aria-live="polite"
                className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
            >
                <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-4 py-3.5">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                            <Truck className="size-4" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-zinc-950">Phí giao hàng</p>
                            <p className="text-xs text-zinc-500">Giao hàng tiêu chuẩn</p>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500">
                        <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                        Đang tính
                    </span>
                </div>
                <div className="flex items-center gap-3 px-4 py-4">
                    <div className="h-2.5 flex-1 animate-pulse rounded-full bg-zinc-100" />
                    <div className="h-4 w-20 animate-pulse rounded-full bg-zinc-100" />
                </div>
                <p className="px-4 pb-4 text-xs text-zinc-500">
                    {isAddressResolving
                        ? 'Đang kiểm tra địa chỉ nhận hàng...'
                        : 'Đang lấy mức phí phù hợp từ GHN...'}
                </p>
            </section>
        );
    }

    if (mappingRequired) {
        return (
            <section className="mt-5 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50/70 px-4 py-3.5">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <MapPinned className="size-4" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-zinc-950">Phí giao hàng</p>
                            <p className="text-xs text-zinc-500">Cần bổ sung thông tin địa chỉ</p>
                        </div>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                        Chưa hoàn tất
                    </span>
                </div>
                <div className="flex items-start gap-3 px-4 py-4 text-sm text-zinc-600">
                    <MapPinned className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden="true" />
                    <p>Chọn đủ tỉnh/thành phố, quận/huyện và phường/xã để tính phí giao hàng.</p>
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <section
                role="alert"
                className="mt-5 overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm"
            >
                <div className="flex items-center justify-between border-b border-red-100 bg-red-50/70 px-4 py-3.5">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-red-100 text-red-600">
                            <CircleAlert className="size-4" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-zinc-950">Phí giao hàng</p>
                            <p className="text-xs text-zinc-500">Chưa thể lấy báo giá</p>
                        </div>
                    </div>
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                        Có lỗi
                    </span>
                </div>
                <div className="px-4 py-4">
                    <p className="text-sm leading-5 text-zinc-600">
                        Chưa thể tính phí giao hàng lúc này. Vui lòng thử lại hoặc kiểm tra lại địa chỉ nhận hàng.
                    </p>
                    <button
                        type="button"
                        onClick={onRetry}
                        className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
                    >
                        <RefreshCw className="size-3.5" aria-hidden="true" />
                        Thử lại
                    </button>
                </div>
            </section>
        );
    }

    if (shippingFee !== undefined) {
        return (
            <section className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-4 py-3.5">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                            <Truck className="size-4" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-zinc-950">Phí giao hàng</p>
                            <p className="text-xs text-zinc-500">Giao hàng tiêu chuẩn</p>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200">
                        <ShieldCheck className="size-3.5" aria-hidden="true" />
                        Đã tính
                    </span>
                </div>
                <div className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                            <Truck className="size-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-zinc-900">
                                {shippingFeeBreakdown[0]?.serviceName ?? 'GHN · Giao tiêu chuẩn'}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-500">
                                Phí được tính theo địa chỉ và thông tin kiện hàng
                            </p>
                        </div>
                        <p className="shrink-0 text-base font-bold text-zinc-950">{shippingFee}</p>
                    </div>

                    {shippingFeeBreakdown.length > 1 ? (
                        <div className="mt-4 space-y-2 border-t border-zinc-100 pt-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                                Chi tiết theo shop
                            </p>
                            {shippingFeeBreakdown.map((item) => (
                                <div key={item.shopId} className="flex items-center justify-between gap-3 text-sm">
                                    <span className="truncate text-zinc-600">{item.serviceName}</span>
                                    <span className="shrink-0 font-medium text-zinc-900">{formatPrice(item.fee)}</span>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    <div className="mt-4 flex items-start gap-2 rounded-xl bg-zinc-50 px-3 py-2.5 text-xs leading-5 text-zinc-500">
                        <Info className="mt-0.5 size-3.5 shrink-0 text-zinc-400" aria-hidden="true" />
                        Mức phí có thể được xác nhận lại khi shop tiếp nhận đơn hàng.
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-4 py-3.5">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                        <Truck className="size-4" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-zinc-950">Phí giao hàng</p>
                        <p className="text-xs text-zinc-500">Giao hàng tiêu chuẩn</p>
                    </div>
                </div>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500">
                    Chờ địa chỉ
                </span>
            </div>
            <div className="flex items-start gap-3 px-4 py-4 text-sm text-zinc-500">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-zinc-400" aria-hidden="true" />
                <p>Chọn địa chỉ nhận hàng để xem phí giao hàng chính xác.</p>
            </div>
        </section>
    );
}
