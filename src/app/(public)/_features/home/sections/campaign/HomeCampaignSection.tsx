import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowRight,
    BadgeCheck,
    PackageSearch,
    ShoppingBag,
    Store,
} from 'lucide-react';

import type { PublicProduct } from '@/services/product';
import {
    formatProductPrice,
    getProductThumbnail,
} from '@/features/products/utils/product-formatters';
import { CampaignTile } from './CampaignTile';

interface HomeCampaignSectionProps {
    products: PublicProduct[];
    totalProducts: number;
}

// Tạo điểm vào mua sắm từ dữ liệu thật, ưu tiên ảnh và giá sản phẩm thay vì banner trang trí không có hành động rõ ràng.
export function HomeCampaignSection({
    products,
    totalProducts,
}: HomeCampaignSectionProps) {
    const [primaryProduct, secondProduct, thirdProduct] = products;
    const primaryImageUrl = primaryProduct
        ? getProductThumbnail(primaryProduct)
        : null;

    return (
        <section className="bg-zinc-100 px-3 pb-3 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-3 lg:grid-cols-[minmax(0,1.9fr)_minmax(310px,0.8fr)]">
                <article className="grid min-h-[330px] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 text-white sm:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)]">
                    <div className="flex min-h-[300px] flex-col justify-center p-6 sm:p-8 lg:p-10">
                        <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-md border border-white/20 bg-white/5 px-2.5 py-1 text-xs font-semibold">
                            <BadgeCheck className="h-4 w-4" />
                            Mua sắm trên Bin
                        </span>
                        <h1 className="max-w-lg text-3xl font-bold leading-tight sm:text-4xl">
                            Chọn đúng sản phẩm, mua sắm dễ dàng hơn.
                        </h1>
                        <p className="mt-4 max-w-md text-sm leading-6 text-zinc-300">
                            Khám phá {totalProducts.toLocaleString('vi-VN')} sản phẩm
                            với thông tin giá, thương hiệu và gian hàng rõ ràng.
                        </p>
                        <a
                            href="#products"
                            className="mt-6 inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                        >
                            Mua sắm ngay
                            <ArrowRight className="h-4 w-4" />
                        </a>
                    </div>

                    <div className="p-3 pt-0 sm:pl-0 sm:pt-3">
                        {primaryProduct && primaryImageUrl ? (
                            <Link
                                href={`/products/${primaryProduct.id}`}
                                className="group flex h-full min-h-64 flex-col overflow-hidden rounded-md bg-white text-zinc-950"
                            >
                                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 text-xs font-semibold">
                                    <span className="inline-flex items-center gap-2">
                                        <ShoppingBag className="h-4 w-4" />
                                        Sản phẩm được chọn
                                    </span>
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                                <div className="relative min-h-44 flex-1">
                                    <Image
                                        src={primaryImageUrl}
                                        alt={primaryProduct.name}
                                        fill
                                        priority
                                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 42vw, 30vw"
                                        className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
                                    />
                                </div>
                                <div className="border-t border-zinc-100 px-4 py-3">
                                    <p className="line-clamp-1 text-sm font-semibold">
                                        {primaryProduct.name}
                                    </p>
                                    <p className="mt-1 text-base font-bold">
                                        {formatProductPrice(primaryProduct.minPrice)}
                                    </p>
                                </div>
                            </Link>
                        ) : (
                            <div className="flex h-full min-h-64 items-center justify-center rounded-md border border-dashed border-white/20 text-sm text-zinc-400">
                                Sản phẩm nổi bật đang được cập nhật
                            </div>
                        )}
                    </div>
                </article>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <CampaignTile
                        product={secondProduct}
                        icon={<PackageSearch className="h-4 w-4" />}
                        label="Sản phẩm mới"
                        tone="light"
                    />
                    <CampaignTile
                        product={thirdProduct}
                        icon={<Store className="h-4 w-4" />}
                        label="Gian hàng nổi bật"
                        tone="accent"
                    />
                </div>
            </div>
        </section>
    );
}
