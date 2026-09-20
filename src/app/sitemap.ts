// File này tạo sitemap server-side cho các route public và product đang active.
// Nếu API catalog tạm thời lỗi, sitemap vẫn trả các route tĩnh để deploy không
// bị fail và crawler vẫn tiếp cận được trang chủ cùng các khu vực khám phá.

import type { MetadataRoute } from 'next';

import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import { SITE_URL } from '@/config/site.config';
import type {
    PaginatedProductResponse,
    PublicProduct,
} from '@/services/product/types/product.types';

// Đọc một trang product active; endpoint public không cần cookie hoặc token.
async function fetchProductPage(
    page: number,
): Promise<PaginatedProductResponse<PublicProduct> | null> {
    try {
        const response = await fetch(
            `${API_BASE_URL}${API_VERSION}/products?status=ACTIVE&page=${page}&pageSize=100`,
            { next: { revalidate: 3600 } },
        );

        if (!response.ok) return null;

        return (await response.json()) as PaginatedProductResponse<PublicProduct>;
    } catch {
        return null;
    }
}

// Đọc trang đầu để biết tổng số trang, sau đó tải các trang còn lại song song.
// Cách này đưa toàn bộ product active vào sitemap mà không tạo chuỗi request tuần tự.
async function fetchActiveProducts(): Promise<PublicProduct[]> {
    const firstPage = await fetchProductPage(1);
    if (!firstPage) return [];

    const remainingPages = Array.from(
        { length: Math.max(firstPage.totalPages - 1, 0) },
        (_, index) => index + 2,
    );
    const pages = await Promise.all(remainingPages.map(fetchProductPage));

    return [firstPage, ...pages.filter(Boolean)].flatMap(
        (page) => page?.items ?? [],
    );
}

// Chuyển read model product thành entry sitemap có canonical URL ổn định.
function buildProductRoute(product: PublicProduct) {
    return {
        url: `${SITE_URL}/products/${product.id}`,
        changeFrequency: 'daily' as const,
        priority: 0.8,
    };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const products = await fetchActiveProducts();
    const staticRoutes = [
        '',
        '/showcase',
        '/internal-shop',
        '/goi-y-hom-nay',
    ].map((path) => ({
        url: `${SITE_URL}${path}`,
        changeFrequency: 'daily' as const,
        priority: path === '' ? 1 : 0.7,
    }));

    const productRoutes = products.map(buildProductRoute);

    return [...staticRoutes, ...productRoutes];
}
