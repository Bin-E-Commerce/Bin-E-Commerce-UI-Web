// Hero chi tiet san pham seller; hien thi thong tin van hanh can thiet ma khong lo ID noi bo.

import { Button } from '@/components/ui/button';
import {
    Boxes,
    CalendarClock,
    Eye,
    EyeOff,
    Hash,
    PackageCheck,
    Pencil,
    Power,
    Star,
} from 'lucide-react';
import Link from 'next/link';

import { ProductGallery } from '@/app/(public)/product-detail/components/gallery/ProductGallery';
import type { SellerProductDetail } from '@/services/product';
import {
    formatSellerProductMetric,
    formatSellerProductPriceRange,
    formatSellerProductUpdatedAt,
} from '../../product-shared/utils/seller-product-formatters';
import { SellerProductStatusBadge } from '../../product-shared/components/SellerProductStatusBadge';
import { useSessionPermission } from '@/hooks/auth/use-session-access';
import type { SellerProductPublicationStatus } from '@/services/product';

interface SellerProductDetailHeroProps {
    product: SellerProductDetail;
    totalStock: number;
    onChangeStatus: (status: SellerProductPublicationStatus) => void;
}

// Trình bày phần quan trọng nhất của sản phẩm: media, trạng thái, giá và các chỉ số seller cần quét nhanh.
export function SellerProductDetailHero({
    product,
    totalStock,
    onChangeStatus,
}: SellerProductDetailHeroProps) {
    const canUpdate = useSessionPermission('seller.product.update');
    const canChangeStatus = useSessionPermission(
        'seller.product.status.update',
    );

    return (
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                <div className="min-w-0 border-b border-zinc-200 bg-zinc-50 lg:border-b-0 lg:border-r">
                    <ProductGallery
                        productName={product.name}
                        images={product.images ?? []}
                        videoUrl={product.videoUrl}
                        videoDurationSeconds={product.videoDurationSeconds}
                        compact
                    />
                </div>

                <div className="flex min-w-0 flex-col p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <SellerProductStatusBadge status={product.status} />
                        {canUpdate ? (
                            <Link
                                href={`/seller/products/${product.id}/edit`}
                                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700"
                            >
                                <Pencil
                                    className="size-3.5"
                                    aria-hidden="true"
                                />
                                Chỉnh sửa
                            </Link>
                        ) : null}
                        {canChangeStatus ? (
                            <Button
                                variant="ghost"
                                type="button"
                                onClick={() =>
                                    onChangeStatus(
                                        product.status === 'ACTIVE'
                                            ? 'INACTIVE'
                                            : 'ACTIVE',
                                    )
                                }
                                className={
                                    product.status === 'ACTIVE'
                                        ? 'inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100'
                                        : 'inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100'
                                }
                            >
                                {product.status === 'ACTIVE' ? (
                                    <EyeOff
                                        className="size-3.5"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <Power
                                        className="size-3.5"
                                        aria-hidden="true"
                                    />
                                )}
                                {product.status === 'ACTIVE'
                                    ? 'Tắt bán'
                                    : 'Đăng bán'}
                            </Button>
                        ) : null}
                    </div>

                    <h1 className="mt-3 max-w-3xl text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
                        {product.name}
                    </h1>
                    <p className="mt-1.5 break-all text-xs text-zinc-500 sm:text-sm">
                        /{product.slug}
                    </p>
                    <p className="mt-2.5 max-w-2xl text-sm leading-5 text-zinc-600">
                        {product.shortDescription ||
                            'Chưa có mô tả ngắn cho sản phẩm này.'}
                    </p>

                    <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-950 p-4 text-white">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
                            Giá bán hiện tại
                        </p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight sm:text-[1.7rem]">
                            {formatSellerProductPriceRange(
                                product.minPrice,
                                product.maxPrice,
                            )}
                        </p>
                        <p className="mt-1.5 text-xs text-zinc-400">
                            Khoảng giá được tính từ các phân loại đang có trong
                            sản phẩm.
                        </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                        <HeroMetric
                            icon={Boxes}
                            label="Tồn kho"
                            value={formatSellerProductMetric(totalStock)}
                        />
                        <HeroMetric
                            icon={PackageCheck}
                            label="Đã bán"
                            value={formatSellerProductMetric(product.totalSold)}
                        />
                        <HeroMetric
                            icon={Star}
                            label="Đánh giá"
                            value={product.ratingAvg ?? '—'}
                        />
                        <HeroMetric
                            icon={Eye}
                            label="Lượt xem"
                            value={formatSellerProductMetric(product.viewCount)}
                        />
                    </div>

                    <div className="mt-auto grid gap-x-4 gap-y-2 border-t border-zinc-100 pt-4 sm:grid-cols-2">
                        <MetaItem
                            icon={Hash}
                            label="SKU quản lý"
                            value={product.sellerSku || 'Chưa thiết lập'}
                        />
                        <MetaItem
                            icon={CalendarClock}
                            label="Cập nhật"
                            value={formatSellerProductUpdatedAt(
                                product.updatedAt,
                            )}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

interface HeroMetricProps {
    icon: typeof Boxes;
    label: string;
    value: string;
}

// Dùng cùng một thẻ metric cho bốn chỉ số để khu vực hero có nhịp đọc ổn định trên mobile và desktop.
function HeroMetric({ icon: Icon, label, value }: HeroMetricProps) {
    return (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Icon className="size-3.5" aria-hidden="true" />
                {label}
            </div>
            <p className="mt-1.5 truncate text-sm font-bold text-zinc-950">
                {value}
            </p>
        </div>
    );
}

interface MetaItemProps {
    icon: typeof Hash;
    label: string;
    value: string;
}

// Hiển thị metadata ngắn ở cuối hero để không làm loãng tiêu đề và giá bán chính.
function MetaItem({ icon: Icon, label, value }: MetaItemProps) {
    return (
        <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Icon className="size-3.5" aria-hidden="true" />
                {label}
            </p>
            <p className="mt-1 truncate text-sm font-medium text-zinc-900">
                {value}
            </p>
        </div>
    );
}
