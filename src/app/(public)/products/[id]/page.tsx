import type { Metadata } from 'next';

import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_NAME } from '@/config/site.config';
import {
    buildAbsoluteUrl,
    buildProductJsonLd,
    buildSeoDescription,
    fetchProductForSeo,
    getProductSeoImages,
} from '@/seo/catalog-seo';

import { ProductDetailPageContent } from '../../product-detail/ProductDetailPageContent';

interface ProductDetailPageProps {
    params: Promise<{ id: string }>;
}

// Tạo metadata và structured data từ read model public để crawler thấy nội dung
// sản phẩm ngay trong HTML, trong khi component client vẫn giữ nguyên trải nghiệm
// query/cache hiện tại cho người dùng.
export async function generateMetadata({
    params,
}: ProductDetailPageProps): Promise<Metadata> {
    const { id } = await params;
    const product = await fetchProductForSeo(id);

    if (!product) {
        return {
            title: `Sản phẩm | ${SITE_NAME}`,
            robots: { index: false, follow: false },
        };
    }

    const canonicalUrl = buildAbsoluteUrl(`/products/${product.id}`);
    const description = buildSeoDescription(
        product.shortDescription ?? product.description,
        'Khám phá sản phẩm chất lượng tại Bin E-Commerce.',
    );
    const images = getProductSeoImages(product);

    return {
        title: product.name,
        description,
        alternates: { canonical: canonicalUrl },
        openGraph: {
            type: 'website',
            url: canonicalUrl,
            title: product.name,
            description,
            siteName: SITE_NAME,
            images: images.map((url) => ({ url, alt: product.name })),
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description,
            images,
        },
    };
}

// Đọc product ID từ dynamic route rồi chuyển phần UI cho feature client.
export default async function ProductDetailPage({
    params,
}: ProductDetailPageProps) {
    const { id } = await params;
    const product = await fetchProductForSeo(id);
    const canonicalUrl = buildAbsoluteUrl(`/products/${id}`);

    return (
        <>
            {product ? (
                <JsonLd data={buildProductJsonLd(product, canonicalUrl)} />
            ) : null}
            <ProductDetailPageContent productId={id} />
        </>
    );
}
