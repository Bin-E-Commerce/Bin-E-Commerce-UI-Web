// File này tập trung các hằng số nhận diện public của website.
// File không chứa secret và không quyết định cấu hình API; các giá trị này
// chỉ phục vụ canonical URL, metadata, Open Graph, sitemap và structured data.

export const SITE_NAME = 'Bin E-Commerce';

export const SITE_DESCRIPTION =
    'Mua sắm thông minh, khám phá sản phẩm chất lượng và trải nghiệm thương mại điện tử hiện đại.';

export const SITE_URL = (
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.binecommerce.site'
).replace(/\/+$/, '');

// Ảnh này là fallback cho trang chủ hoặc trang không có ảnh riêng.
// Đặt file thiết kế tại public/images/seo/bin-ecommerce-og-default.png,
// ưu tiên kích thước 1200x630 để bản xem trước trên Zalo và Facebook cân đối.
export const DEFAULT_OG_IMAGE_URL = `${SITE_URL}/images/seo/bin-ecommerce-og-default.png`;
