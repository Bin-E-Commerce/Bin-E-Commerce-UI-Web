// File này cung cấp dữ liệu SEO server-side cho sản phẩm và shop public.
// Các hàm chỉ đọc read model public qua API Gateway; không đọc cookie, token,
// dữ liệu giỏ hàng hoặc thông tin riêng tư của người dùng.

import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import { DEFAULT_OG_IMAGE_URL, SITE_URL } from '@/config/site.config';
import type { ProductDetail } from '@/services/product/types/product.types';
import type { PublicShopResponse } from '@/services/seller/types/public-shop.types';

const SEO_REVALIDATE_SECONDS = 300;

// Đọc JSON public ở server để metadata được tạo ngay trong HTML mà crawler nhận được.
// Khi API lỗi hoặc sản phẩm không tồn tại, hàm trả null để page vẫn render được
// với metadata mặc định thay vì làm hỏng toàn bộ route public.
async function fetchPublicJson<T>(url: string): Promise<T | null> {
    try {
        const response = await fetch(url, {
            headers: { Accept: 'application/json' },
            next: { revalidate: SEO_REVALIDATE_SECONDS },
        });

        if (!response.ok) return null;
        return (await response.json()) as T;
    } catch {
        return null;
    }
}

// Lấy product public bằng ID đúng với route hiện tại `/products/[id]`.
// Request không cần authentication để crawler, Facebook hoặc Zalo có thể đọc
// được title, mô tả và ảnh khi người dùng chia sẻ liên kết sản phẩm.
export async function fetchProductForSeo(
    productId: string,
): Promise<ProductDetail | null> {
    return fetchPublicJson<ProductDetail>(
        `${API_BASE_URL}${API_VERSION}/products/${encodeURIComponent(productId)}`,
    );
}

// Lấy shop nội bộ trước, sau đó thử external shop để cùng một route `/shop/[slug]`
// hỗ trợ cả hai loại shop mà không làm lộ thông tin riêng tư của seller.
export async function fetchShopForSeo(
    slug: string,
): Promise<PublicShopResponse | null> {
    const encodedSlug = encodeURIComponent(slug);
    const internalShop = await fetchPublicJson<PublicShopResponse>(
        `${API_BASE_URL}${API_VERSION}/shops/${encodedSlug}`,
    );

    if (internalShop) return internalShop;

    return fetchPublicJson<PublicShopResponse>(
        `${API_BASE_URL}${API_VERSION}/products/external-shops/${encodedSlug}`,
    );
}

// Chuyển mô tả có thể chứa HTML thành đoạn text ngắn, an toàn cho meta description.
// Hàm giới hạn độ dài để kết quả hiển thị trên công cụ tìm kiếm không bị cắt quá sớm.
export function buildSeoDescription(
    value: string | null | undefined,
    fallback: string,
): string {
    const plainText = (value ?? '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return (plainText || fallback).slice(0, 160);
}

// Ưu tiên ảnh thumbnail rồi đến thứ tự hiển thị; crawler luôn nhận được một
// ảnh hợp lệ và không phụ thuộc vào thứ tự ngẫu nhiên của API.
export function getProductSeoImages(product: ProductDetail): string[] {
    const images = (product.images ?? [])
        .filter((image) => Boolean(image.imageUrl))
        .sort(
            (left, right) =>
                Number(right.isThumbnail) - Number(left.isThumbnail) ||
                left.sortOrder - right.sortOrder,
        )
        .map((image) => image.imageUrl);

    return images.length > 0 ? images : [DEFAULT_OG_IMAGE_URL];
}

// Chuẩn hóa URL tuyệt đối để canonical, Open Graph và JSON-LD trỏ cùng một địa chỉ.
export function buildAbsoluteUrl(path: string): string {
    return new URL(path, SITE_URL).toString();
}

// Tạo Product structured data giúp Google hiểu tên, ảnh, giá và đánh giá của sản phẩm.
// Giá dùng minPrice dạng số; không lấy displayPrice vì đó là chuỗi đã định dạng cho UI.
export function buildProductJsonLd(
    product: ProductDetail,
    canonicalUrl: string,
): Record<string, unknown> {
    const jsonLd: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: buildSeoDescription(
            product.shortDescription ?? product.description,
            'Khám phá sản phẩm tại Bin E-Commerce.',
        ),
        image: getProductSeoImages(product),
        sku: product.id,
        url: canonicalUrl,
        offers: {
            '@type': 'Offer',
            url: canonicalUrl,
            priceCurrency: 'VND',
            price: product.minPrice,
            availability: 'https://schema.org/InStock',
        },
    };

    if (product.brand?.name) {
        jsonLd.brand = { '@type': 'Brand', name: product.brand.name };
    }

    if (product.ratingAvg && product.reviewCount > 0) {
        jsonLd.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: product.ratingAvg,
            reviewCount: product.reviewCount,
        };
    }

    return jsonLd;
}

// Tạo structured data cho shop public để công cụ tìm kiếm hiểu đây là một
// cửa hàng có tên, mô tả, logo và địa chỉ khu vực công khai.
export function buildShopJsonLd(
    shop: PublicShopResponse,
    canonicalUrl: string,
): Record<string, unknown> {
    const address = shop.shop.location;

    return {
        '@context': 'https://schema.org',
        '@type': 'Store',
        name: shop.shop.name,
        description: buildSeoDescription(
            shop.shop.description,
            `Khám phá sản phẩm từ ${shop.shop.name} trên Bin E-Commerce.`,
        ),
        image: shop.shop.logoUrl || DEFAULT_OG_IMAGE_URL,
        url: canonicalUrl,
        address: {
            '@type': 'PostalAddress',
            addressLocality: [address.district, address.province]
                .filter(Boolean)
                .join(', '),
        },
    };
}
