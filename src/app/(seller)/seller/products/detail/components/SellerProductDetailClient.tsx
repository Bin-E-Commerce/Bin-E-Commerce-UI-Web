'use client';

import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSellerProductDetail } from '../hooks/useSellerProductDetail';
import { SellerProductDetailHero } from './SellerProductDetailHero';
import { SellerProductDetailSections } from './SellerProductDetailSections';

// Điều phối request và các trạng thái của màn chi tiết, giữ route mỏng để giao diện được chia thành các vùng dễ bảo trì.
export function SellerProductDetailClient() {
    const params = useParams<{ productId: string }>();
    const productId =
        typeof params.productId === 'string' ? params.productId : undefined;
    const query = useSellerProductDetail(productId);

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
        (total, variant) => total + Math.max(variant.stockQuantity, 0),
        0,
    );

    return (
        <div className="min-h-fullpb-10 text-zinc-950">
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
                />
                <SellerProductDetailSections product={product} />
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
