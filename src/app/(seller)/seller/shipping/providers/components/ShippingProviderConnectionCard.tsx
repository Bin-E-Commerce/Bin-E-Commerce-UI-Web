// Card mô tả kết nối GHN Test và các khả năng Seller đang sử dụng.

import { CheckCircle2, FileText, Info, Settings2, Truck } from 'lucide-react';

// Hiển thị provider duy nhất ở chế độ read-only để tránh Seller hiểu nhầm có thể đổi credential.
export function ShippingProviderConnectionCard() {
    return (
        <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-sm font-bold text-white">01</span>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.17em] text-zinc-400">Kết nối hiện tại</p>
                        <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">GHN Test</h2>
                        <p className="mt-1 text-sm leading-6 text-zinc-500">Môi trường kiểm thử do platform quản lý, không cần Seller nhập token.</p>
                    </div>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700">
                    <Settings2 className="size-3.5" />
                    Cấu hình tập trung
                </span>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-zinc-50 p-4">
                    <FileText className="size-5 text-zinc-700" />
                    <p className="mt-4 text-sm font-semibold text-zinc-950">Tính phí</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">Tính theo từng shop tại checkout.</p>
                </div>
                <div className="rounded-2xl bg-zinc-50 p-4">
                    <Truck className="size-5 text-zinc-700" />
                    <p className="mt-4 text-sm font-semibold text-zinc-950">Tạo vận đơn</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">Tạo từ chi tiết đơn Seller.</p>
                </div>
                <div className="rounded-2xl bg-zinc-50 p-4">
                    <CheckCircle2 className="size-5 text-zinc-700" />
                    <p className="mt-4 text-sm font-semibold text-zinc-950">Tracking</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">Đồng bộ trạng thái và hủy đủ điều kiện.</p>
                </div>
            </div>

            <p className="mt-5 border-t border-zinc-200 pt-5 text-sm leading-6 text-zinc-500">Staging chỉ phục vụ kiểm thử request/response và luồng vận hành, không tạo giao hàng thật.</p>

            <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-700 ring-1 ring-zinc-200">
                        <Settings2 className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-zinc-950">Cấu hình để shop hoạt động</p>
                    <p className="mt-1 text-sm leading-5 text-zinc-500">Seller không nhập token. Credential GHN được quản lý tập trung ở Shipping Service.</p>
                    </div>
                </div>

                <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                    <li className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-white">1</span>
                        <p className="text-xs leading-5 text-zinc-600">Thêm địa chỉ lấy hàng và chọn một địa chỉ làm mặc định.</p>
                    </li>
                    <li className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-white">2</span>
                        <p className="text-xs leading-5 text-zinc-600">Lưu thời gian chuẩn bị và khung giờ GHN đến nhận hàng.</p>
                    </li>
                    <li className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-white">3</span>
                        <p className="text-xs leading-5 text-zinc-600">Quản trị viên cấu hình credential GHN Test trên server.</p>
                    </li>
                    <li className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-white">4</span>
                        <p className="text-xs leading-5 text-zinc-600">Tải lại trang rồi thử tính phí hoặc tạo vận đơn.</p>
                    </li>
                </ol>

                <div className="mt-4 flex items-start gap-2.5 border-t border-zinc-200 pt-4 text-xs leading-5 text-zinc-500">
                    <Info className="mt-0.5 size-4 shrink-0 text-zinc-500" aria-hidden="true" />
                    <p>Thiếu credential sẽ khiến quote và tạo vận đơn bị tạm dừng; đây là lỗi cấu hình platform, không phải lỗi địa chỉ người mua.</p>
                </div>
            </div>
        </section>
    );
}
