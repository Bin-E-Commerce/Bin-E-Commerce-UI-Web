// Vùng kết quả shop: gom loading, lỗi, rỗng và danh sách để page không phải lồng nhiều điều kiện UI.

import { Store } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { PublicShopListItem } from '@/services/seller';
import { InternalShopCard } from '../shop-card/InternalShopCard';

// Hiển thị đúng một trạng thái kết quả dựa trên dữ liệu query đã được parent chuẩn hóa.
export function ShopDirectoryResults({
    shops,
    isPending,
    isError,
    onRetry,
}: {
    shops: PublicShopListItem[];
    isPending: boolean;
    isError: boolean;
    onRetry: () => void;
}) {
    if (isPending)
        return (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                    <div
                        key={index}
                        className="h-[390px] animate-pulse rounded-2xl border border-zinc-200 bg-white"
                    />
                ))}
            </div>
        );
    if (isError)
        return (
            <EmptyResult
                title="Không thể tải danh sách shop"
                description="Vui lòng kiểm tra Seller Service rồi thử lại."
            >
                <Button
                    type="button"
                    variant="outline"
                    className="mt-5"
                    onClick={onRetry}
                >
                    Thử lại
                </Button>
            </EmptyResult>
        );
    if (shops.length === 0)
        return (
            <EmptyResult
                title="Chưa tìm thấy shop phù hợp"
                description="Thử tìm bằng tên shop khác hoặc xóa từ khóa tìm kiếm."
            >
                <Store className="mx-auto h-10 w-10 text-zinc-300" />
            </EmptyResult>
        );
    return (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {shops.map((item) => (
                <InternalShopCard key={item.shop.id} item={item} />
            ))}
        </div>
    );
}

// Dùng chung layout cho lỗi và kết quả rỗng để người dùng luôn có hướng xử lý tiếp theo.
function EmptyResult({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
            {children}
            <p className="mt-4 font-semibold text-zinc-950">{title}</p>
            <p className="mt-2 text-sm text-zinc-500">{description}</p>
        </div>
    );
}
