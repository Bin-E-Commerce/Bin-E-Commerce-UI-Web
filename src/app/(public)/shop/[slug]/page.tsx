import type { Metadata } from 'next';

import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_NAME } from '@/config/site.config';
import {
    buildAbsoluteUrl,
    buildSeoDescription,
    buildShopJsonLd,
    fetchShopForSeo,
} from '@/seo/catalog-seo';

import { ShopPageContent } from './components/ShopPageContent';

interface PublicShopPageProps {
    params: Promise<{ slug: string }>;
}

// Tạo metadata động cho shop để khi chia sẻ link, mạng xã hội nhận đúng tên,
// mô tả và logo shop thay vì chỉ nhận title chung của website.
export async function generateMetadata({
    params,
}: PublicShopPageProps): Promise<Metadata> {
    const { slug } = await params;
    const shop = await fetchShopForSeo(slug);

    if (!shop) {
        return {
            title: `Cửa hàng | ${SITE_NAME}`,
            robots: { index: false, follow: false },
        };
    }

    const canonicalUrl = buildAbsoluteUrl(`/shop/${slug}`);
    const description = buildSeoDescription(
        shop.shop.description,
        `Khám phá sản phẩm từ ${shop.shop.name} trên Bin E-Commerce.`,
    );

    return {
        title: shop.shop.name,
        description,
        alternates: { canonical: canonicalUrl },
        openGraph: {
            type: 'website',
            url: canonicalUrl,
            title: shop.shop.name,
            description,
            siteName: SITE_NAME,
            images: [{ url: shop.shop.logoUrl, alt: shop.shop.name }],
        },
        twitter: {
            card: 'summary_large_image',
            title: shop.shop.name,
            description,
            images: [shop.shop.logoUrl],
        },
    };
}

// Route chỉ đọc slug động và giao phần data/UI cho feature component của trang shop.
export default async function PublicShopPage({ params }: PublicShopPageProps) {
    const { slug } = await params;
    const shop = await fetchShopForSeo(slug);
    const canonicalUrl = buildAbsoluteUrl(`/shop/${slug}`);

    return (
        <>
            {shop ? (
                <JsonLd data={buildShopJsonLd(shop, canonicalUrl)} />
            ) : null}
            <ShopPageContent slug={slug} />
        </>
    );
}
