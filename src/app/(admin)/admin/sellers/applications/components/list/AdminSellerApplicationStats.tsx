import { ClipboardCheck, Clock3, FileText } from 'lucide-react';

interface AdminSellerApplicationStatsProps {
    totalItems: number;
    pageItems: number;
    pendingItems: number;
}

// Hiển thị chỉ số ngắn ngay trên bảng để admin biết phạm vi dữ liệu đang xem.
export function AdminSellerApplicationStats({
    totalItems,
    pageItems,
    pendingItems,
}: AdminSellerApplicationStatsProps) {
    return (
        <section className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-500">Tổng hồ sơ</p>
                    <FileText className="size-4 text-zinc-400" />
                </div>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{totalItems}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-500">Đang hiển thị</p>
                    <ClipboardCheck className="size-4 text-zinc-400" />
                </div>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{pageItems}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-500">Chờ duyệt trên trang</p>
                    <Clock3 className="size-4 text-zinc-400" />
                </div>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{pendingItems}</p>
            </div>
        </section>
    );
}
