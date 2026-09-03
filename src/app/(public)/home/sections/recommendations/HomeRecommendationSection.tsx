// Section homepage hiển thị 20 sản phẩm gợi ý và mở rộng sang trang gợi ý riêng.

'use client';

import Link from 'next/link';
import { ArrowRight, LockKeyhole } from 'lucide-react';

import type { PublicProduct } from '@/services/product';
import { useCartAuthRedirect } from '@/app/(public)/cart/hooks/use-cart-auth-redirect';
import { HomeProductSection } from '../products/HomeProductSection';

interface HomeRecommendationSectionProps {
    products: PublicProduct[];
    hasMoreProducts: boolean;
}

// Trình bày 20 sản phẩm đầu tiên và dẫn người dùng tới không gian gợi ý riêng khi muốn khám phá thêm.
export function HomeRecommendationSection({
    products,
    hasMoreProducts,
}: HomeRecommendationSectionProps) {
    const { initialized, isAuthenticated, getProtectedHref } =
        useCartAuthRedirect();
    if (products.length === 0) return null;

    return (
        <HomeProductSection
            id="recommendations"
            eyebrow="Dành cho bạn"
            title="Gợi ý hôm nay"
            description="Khám phá sản phẩm từ nhiều ngành hàng, được chọn từ dữ liệu đang có trên Bin E-Commerce."
            products={products}
            mode="grid"
            footer={
                hasMoreProducts ? (
                    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                        <p className="text-center text-xs leading-5 text-zinc-500 sm:text-left sm:text-sm">
                            {isAuthenticated
                                ? 'Khám phá thêm nhiều sản phẩm được chọn từ các ngành hàng trên Bin E-Commerce.'
                                : 'Đăng nhập để mở rộng danh sách gợi ý và khám phá thêm nhiều sản phẩm.'}
                        </p>
                        <Link
                            href={
                                initialized
                                    ? getProtectedHref('/goi-y-hom-nay')
                                    : '#recommendations'
                            }
                            aria-disabled={!initialized}
                            onClick={(event) => {
                                if (!initialized) event.preventDefault();
                            }}
                            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-950 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                        >
                            {!isAuthenticated ? (
                                <LockKeyhole className="h-4 w-4" />
                            ) : null}
                            {isAuthenticated
                                ? 'Xem thêm gợi ý'
                                : 'Đăng nhập để xem thêm'}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : null
            }
        />
    );
}
