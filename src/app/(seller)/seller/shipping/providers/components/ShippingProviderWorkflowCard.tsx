// Cột tóm tắt địa chỉ và luồng xử lý, giúp Seller luôn biết bước tiếp theo.

import { ArrowRight, CheckCircle2, Clock3, MapPin, Truck } from 'lucide-react';
import Link from 'next/link';

interface ShippingProviderWorkflowCardProps {
    hasDefaultPickupAddress: boolean;
}

// Gộp các thông tin cần nhớ vào cột phụ để giảm chiều cao trang mà vẫn giữ ngữ cảnh vận hành.
export function ShippingProviderWorkflowCard({ hasDefaultPickupAddress }: ShippingProviderWorkflowCardProps) {
    return (
        <div className="space-y-5 lg:sticky lg:top-5">
            <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                        <MapPin className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.17em] text-zinc-400">Địa chỉ shop</p>
                        <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-950">Nơi lấy hàng</h2>
                        <p className="mt-1 text-sm leading-6 text-zinc-500">Cần có địa chỉ mặc định để tính phí và tạo vận đơn.</p>
                    </div>
                </div>

                <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-zinc-700" />
                        <div>
                            <p className="text-sm font-semibold text-zinc-950">{hasDefaultPickupAddress ? 'Đã chọn địa chỉ mặc định' : 'Chưa chọn địa chỉ mặc định'}</p>
                            <p className="mt-1 text-xs leading-5 text-zinc-500">{hasDefaultPickupAddress ? 'Địa chỉ này được dùng khi tạo báo giá và vận đơn.' : 'Hãy bổ sung địa chỉ trước khi shop nhận đơn mới.'}</p>
                        </div>
                    </div>
                </div>

                <Link href="/seller/shipping/settings" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800">
                    Quản lý địa chỉ lấy hàng
                    <ArrowRight className="size-4" />
                </Link>
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                        <Clock3 className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.17em] text-zinc-400">Luồng xử lý</p>
                        <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-950">Đơn hàng đi như thế nào?</h2>
                    </div>
                </div>

                <div className="mt-5 ml-4 border-l border-zinc-200">
                    <div className="relative -ml-4 flex gap-3 pb-5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-white">1</span>
                        <div>
                            <p className="text-sm font-semibold text-zinc-950">Checkout tính phí</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">GHN tính riêng phí theo shop.</p>
                        </div>
                    </div>
                    <div className="relative -ml-4 flex gap-3 pb-5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-700">2</span>
                        <div>
                            <p className="text-sm font-semibold text-zinc-950">Seller tạo vận đơn</p>
                            <p className="mt-1 text-xs leading-5 text-zinc-500">Thao tác sau khi chuẩn bị hàng.</p>
                        </div>
                    </div>
                    <div className="relative -ml-4 flex gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
                            <Truck className="size-4" />
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-zinc-950">Đồng bộ trạng thái</p>
                            <p className="mt-1 text-xs leading-5 text-zinc-500">Webhook và polling cập nhật tracking.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
