'use client';

import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSellerProductDetail } from '../hooks/useSellerProductDetail';
import { SellerProductDetailHero } from './SellerProductDetailHero';
import { SellerProductDetailSections } from './SellerProductDetailSections';
import {
    SellerProductStatusDialog,
    type SellerProductStatusTarget,
} from '../../product-shared/components/SellerProductStatusDialog';
import { useChangeSellerProductStatus } from '../../product-shared/hooks/useChangeSellerProductStatus';
import type { SellerProductPublicationStatus } from '@/services/product';

// Điều phối request và các trạng thái của màn chi tiết, giữ route mỏng để giao diện được chia thành các vùng dễ bảo trì.
export function SellerProductDetailClient() {
    const params = useParams<{ productId: string }>();
    const productId =
        typeof params.productId === 'string' ? params.productId : undefined;
    const query = useSellerProductDetail(productId);
    const [statusTarget, setStatusTarget] =
        useState<SellerProductStatusTarget | null>(null);
    const [targetStatus, setTargetStatus] =
        useState<SellerProductPublicationStatus | null>(null);
    const statusMutation = useChangeSellerProductStatus();

    if (query.isLoading) return <SellerProductDetailSkeleton />;

    if (query.isError || !query.data) {
        return (
            <section className="flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-white text-red-500 shadow-sm">
                    <AlertCircle className="size-6" aria-hidden="true" />
                </span>
                <div>
                    <h1 className="text-lg font-semibold text-zinc-950">
                        Không tải được chi tiết sản phẩm
                    </h1>
                    <p className="mt-1 max-w-md text-sm leading-6 text-zinc-600">
                        Sản phẩm không tồn tại, không thuộc shop của bạn hoặc
                        dịch vụ đang tạm gián đoạn.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    <Button variant="outline" onClick={() => query.refetch()}>
                        Thử lại
                    </Button>
                    <Button render={<Link href="/seller/products" />}>
                        Về danh sách
                    </Button>
                </div>
            </section>
        );
    }

    const product = query.data;
    // Tổng hợp tồn kho ở cấp variant để seller nhìn đúng số lượng có thể xử lý đơn.
    const totalStock = product.variants.reduce(
        (total, variant) =>
            total + Math.max(variant.inventory?.quantityAvailable ?? 0, 0),
        0,
    );

    // Mở cùng dialog xác nhận với danh sách để hai điểm thao tác có hành vi và thông điệp nhất quán.
    const openStatusDialog = (nextStatus: SellerProductPublicationStatus) => {
        setStatusTarget({
            id: product.id,
            name: product.name,
            status: product.status,
        });
        setTargetStatus(nextStatus);
    };

    // Cập nhật trạng thái rồi để query detail/list tự làm mới thông qua mutation dùng chung.
    const handleConfirmStatusChange = async () => {
        if (!statusTarget || !targetStatus) return;

        try {
            await statusMutation.mutateAsync({
                productId: statusTarget.id,
                status: targetStatus,
            });
            setStatusTarget(null);
            setTargetStatus(null);
        } catch {
            // Giữ popup mở để seller đọc nguyên nhân và đi tới Thiết lập giao nhận nếu còn thiếu điều kiện.
        }
    };

    return (
        <div className="min-h-full pb-10 text-zinc-950">
            <div className="mx-auto w-full max-w-[1440px] space-y-5 px-4 py-5 sm:px-6 lg:px-8">
                <Link
                    href="/seller/products"
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950"
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Quay lại quản lý sản phẩm
                </Link>
                <SellerProductDetailHero
                    product={product}
                    totalStock={totalStock}
                    onChangeStatus={openStatusDialog}
                />
                <SellerProductDetailSections product={product} />
                <SellerProductStatusDialog
                    product={statusTarget}
                    targetStatus={targetStatus}
                    loading={statusMutation.isPending}
                    onOpenChange={(open) => {
                        if (!open && !statusMutation.isPending) {
                            setStatusTarget(null);
                            setTargetStatus(null);
                        }
                    }}
                    onConfirm={handleConfirmStatusChange}
                />
            </div>
        </div>
    );
}

// Giữ skeleton gần với cấu trúc thật để trang không bị nhảy layout khi dữ liệu đang tải.
function SellerProductDetailSkeleton() {
    return (
        <div className="space-y-5">
            <Skeleton className="h-5 w-56" />
            <div className="grid gap-5 rounded-2xl border border-zinc-200 bg-white p-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:p-6">
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-20 w-full" />
                    <div className="grid grid-cols-2 gap-3">
                        <Skeleton className="h-20" />
                        <Skeleton className="h-20" />
                        <Skeleton className="h-20" />
                        <Skeleton className="h-20" />
                    </div>
                </div>
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
    );
}
