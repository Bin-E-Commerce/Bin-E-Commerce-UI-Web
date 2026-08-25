'use client';

/**
 * Các section của trang xem chi tiết sản phẩm trong Seller Center.
 * File này điều phối layout và dữ liệu vận hành; phần hiển thị mô tả dùng
 * component dùng chung với storefront để hai vai trò luôn có cùng cấp nội dung.
 */
import { type ReactNode } from 'react';
import {
    Box,
    ClipboardList,
    FileText,
    Info,
    Ruler,
    Star,
    Truck,
    type LucideIcon,
} from 'lucide-react';

import { ProductDescriptionBlocks } from '@/app/(public)/_features/product-detail/components/content/ProductDescriptionBlocks';
import { getProductSpecifications } from '@/app/(public)/_features/product-detail/utils/product-detail-presentation';
import type { ProductVariant, SellerProductDetail } from '@/services/product';
import {
    formatSellerProductPrice,
    formatSellerProductUpdatedAt,
} from '../../product-shared/utils/seller-product-formatters';

interface SellerProductDetailSectionsProps {
    product: SellerProductDetail;
}

// Chia dữ liệu dài thành các section độc lập để seller dễ đối chiếu nội dung, vận chuyển và tồn kho.
export function SellerProductDetailSections({
    product,
}: SellerProductDetailSectionsProps) {
    return (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
            <div className="space-y-5">
                <ProductContentSection product={product} />
                <ProductVariantsSection product={product} />
                <ProductReviewsSection product={product} />
            </div>
            <div className="space-y-5">
                <ProductInformationSection product={product} />
                <ProductShippingSection product={product} />
                <ProductAttributesSection product={product} />
            </div>
        </div>
    );
}

// Render mô tả đã được lọc HTML trong vùng giới hạn để seller xem đúng nội dung catalog.
function ProductContentSection({ product }: { product: SellerProductDetail }) {
    return (
        <DetailCard icon={FileText} eyebrow="Nội dung" title="Mô tả sản phẩm">
            <ProductDescriptionBlocks
                description={product.description}
                shortDescription={product.shortDescription}
            />
        </DetailCard>
    );
}

// Hiển thị toàn bộ SKU cùng mã hàng, giá, tồn kho và trạng thái để seller kiểm tra từng biến thể.
function ProductVariantsSection({ product }: { product: SellerProductDetail }) {
    return (
        <DetailCard
            icon={Box}
            eyebrow="Vận hành"
            title="Phân loại và tồn kho"
            description={`${product.variants.length} phân loại trong sản phẩm`}
        >
            {product.variants.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-zinc-200">
                    <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            <tr>
                                <th className="px-4 py-3">Phân loại</th>
                                <th className="px-4 py-3">SKU / GTIN</th>
                                <th className="px-4 py-3">Giá</th>
                                <th className="px-4 py-3">Tồn kho</th>
                                <th className="px-4 py-3">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {product.variants.map((variant) => (
                                <VariantRow key={variant.id} variant={variant} />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <EmptyDetailState text="Chưa có phân loại nào." />
            )}
        </DetailCard>
    );
}

// Render một dòng variant độc lập để bảng không tạo component mới trong mỗi lần render của phần cha.
function VariantRow({ variant }: { variant: ProductVariant }) {
    const variantLabel =
        variant.optionChoices
            .map(
                (choice) =>
                    `${choice.optionValue.option.name}: ${choice.optionValue.value}`,
            )
            .join(' · ') ||
        variant.name ||
        'Sản phẩm mặc định';

    return (
        <tr>
            <td className="px-4 py-4 font-medium text-zinc-950">{variantLabel}</td>
            <td className="px-4 py-4 text-xs text-zinc-600">
                <p className="font-mono">{variant.sku || 'Chưa có SKU'}</p>
                <p className="mt-1">GTIN: {variant.gtin || '—'}</p>
            </td>
            <td className="px-4 py-4 font-medium text-zinc-950">
                {formatSellerProductPrice(variant.price)}
                {variant.originalPrice ? (
                    <span className="mt-1 block text-xs font-normal text-zinc-400 line-through">
                        {formatSellerProductPrice(variant.originalPrice)}
                    </span>
                ) : null}
            </td>
            <td className="px-4 py-4 font-semibold text-zinc-950">
                {variant.stockQuantity.toLocaleString('vi-VN')}
            </td>
            <td className="px-4 py-4">
                <span
                    className={
                        variant.status === 'ACTIVE'
                            ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700'
                            : 'rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600'
                    }
                >
                    {variant.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đang ẩn'}
                </span>
            </td>
        </tr>
    );
}

// Tổng hợp field nghiệp vụ không nằm trong bảng variant để seller kiểm tra nhanh tính hợp lệ của catalog.
function ProductInformationSection({ product }: { product: SellerProductDetail }) {
    return (
        <DetailCard icon={Info} eyebrow="Catalog" title="Thông tin sản phẩm">
            <DetailList
                rows={[
                    ['Thương hiệu', product.brand?.name || 'Chưa cập nhật'],
                    ['SKU quản lý', product.sellerSku || 'Chưa thiết lập'],
                    ['GTIN dùng chung', product.gtin || 'Chưa thiết lập'],
                    ['Tình trạng', getConditionLabel(product.condition)],
                    ['Xuất xứ', product.countryOfOrigin || 'Chưa cập nhật'],
                    ['Category ID', product.categoryId],
                    ['Slug', `/${product.slug}`],
                    ['Tạo lúc', formatSellerProductUpdatedAt(product.createdAt)],
                    ['Cập nhật', formatSellerProductUpdatedAt(product.updatedAt)],
                ]}
            />
        </DetailCard>
    );
}

// Hiển thị quy cách đóng gói mà Shipping Service sẽ dùng để tính phương án giao hàng.
function ProductShippingSection({ product }: { product: SellerProductDetail }) {
    const dimensions = [
        product.packageLengthCm,
        product.packageWidthCm,
        product.packageHeightCm,
    ];
    const hasDimensions = dimensions.every(
        (value) => value !== null && value !== undefined && value !== '',
    );

    return (
        <DetailCard icon={Truck} eyebrow="Giao hàng" title="Đóng gói và vận chuyển">
            <div className="grid grid-cols-2 gap-3">
                <ShippingMetric
                    icon={Box}
                    label="Khối lượng"
                    value={
                        product.packageWeightGrams
                            ? `${product.packageWeightGrams.toLocaleString('vi-VN')} g`
                            : 'Chưa cập nhật'
                    }
                />
                <ShippingMetric
                    icon={Ruler}
                    label="Kích thước"
                    value={
                        hasDimensions
                            ? `${dimensions.join(' × ')} cm`
                            : 'Chưa cập nhật'
                    }
                />
            </div>
            <p className="mt-4 text-xs leading-5 text-zinc-500">
                Thông số được lưu theo kiện hàng sau đóng gói, dùng làm dữ liệu đầu vào cho việc tính phí vận chuyển.
            </p>
        </DetailCard>
    );
}

// Hiển thị các thuộc tính động và nhóm phân loại seller đã khai báo trong form tạo sản phẩm.
function ProductAttributesSection({ product }: { product: SellerProductDetail }) {
    const specifications = getProductSpecifications(product);

    return (
        <DetailCard
            icon={ClipboardList}
            eyebrow="Thuộc tính"
            title="Thông số sản phẩm"
        >
            {specifications.length > 0 ? (
                <DetailList
                    rows={specifications.map((item) => [item.label, item.value])}
                />
            ) : product.options.length > 0 ? (
                <div className="space-y-3">
                    {product.options.map((option) => (
                        <div key={option.id} className="rounded-lg bg-zinc-50 p-3">
                            <p className="text-sm font-medium text-zinc-950">
                                {option.name}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                                {option.values.map((value) => value.value).join(' · ')}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyDetailState text="Chưa có thuộc tính hoặc nhóm phân loại." />
            )}
        </DetailCard>
    );
}

// Hiển thị đánh giá gần nhất để seller theo dõi chất lượng sản phẩm mà không phải rời Seller Center.
function ProductReviewsSection({ product }: { product: SellerProductDetail }) {
    const reviews = product.reviews
        .filter((review) => review.status.toLowerCase() === 'approved')
        .slice(0, 3);

    return (
        <DetailCard
            icon={Star}
            eyebrow="Phản hồi"
            title="Đánh giá gần đây"
            description={`${product.reviewCount} đánh giá · điểm trung bình ${product.ratingAvg ?? 'chưa có'}`}
        >
            {reviews.length > 0 ? (
                <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200">
                    {reviews.map((review) => (
                        <div key={review.id} className="p-4">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-medium text-zinc-500">
                                    {formatSellerProductUpdatedAt(review.createdAt)}
                                </span>
                                <span className="text-xs font-semibold text-amber-600">
                                    {review.rating}/5
                                </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-zinc-700">
                                {review.content || 'Người mua không để lại nội dung.'}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyDetailState text="Chưa có đánh giá được duyệt." />
            )}
        </DetailCard>
    );
}

// Chuẩn hóa nhãn tình trạng để UI không phải hiển thị mã enum kỹ thuật.
function getConditionLabel(condition: SellerProductDetail['condition']): string {
    if (condition === 'used_like_new') return 'Đã qua sử dụng · như mới';
    if (condition === 'used_good') return 'Đã qua sử dụng · tốt';
    return 'Mới';
}

interface DetailCardProps {
    icon: LucideIcon;
    eyebrow: string;
    title: string;
    description?: string;
    children: ReactNode;
}

// Dùng một card shell thống nhất cho mọi section để giao diện có phân cấp rõ ràng và không bị rời rạc.
function DetailCard({
    icon: Icon,
    eyebrow,
    title,
    description,
    children,
}: DetailCardProps) {
    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3 border-b border-zinc-100 pb-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white">
                    <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        {eyebrow}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-zinc-950">{title}</h2>
                    {description ? (
                        <p className="mt-1 text-sm text-zinc-500">{description}</p>
                    ) : null}
                </div>
            </div>
            <div className="pt-5">{children}</div>
        </section>
    );
}

// Render danh sách field dạng hai cột, tự co về một cột trên màn hình hẹp.
function DetailList({ rows }: { rows: Array<[string, string]> }) {
    return (
        <dl className="divide-y divide-zinc-100">
            // Nhãn thuộc tính có thể trùng nhau, nên thêm giá trị và vị trí để key luôn duy nhất.
            {rows.map(([label, value], rowIndex) => (
                <div
                    key={`${label}-${value}-${rowIndex}`}
                    className="grid gap-1 py-3 sm:grid-cols-[145px_1fr] sm:gap-4"
                >
                    <dt className="text-sm text-zinc-500">{label}</dt>
                    <dd className="break-words text-sm font-medium text-zinc-900">
                        {value}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

// Hiển thị số đo vận chuyển bằng cùng một visual treatment để card nhỏ vẫn cân đối.
function ShippingMetric({
    icon: Icon,
    label,
    value,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-lg bg-zinc-50 p-3">
            <Icon className="size-4 text-zinc-500" aria-hidden="true" />
            <p className="mt-2 text-xs text-zinc-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-zinc-950">{value}</p>
        </div>
    );
}

// Hiển thị trạng thái rỗng ngắn gọn cho các section chưa có dữ liệu thay vì để khoảng trắng khó hiểu.
function EmptyDetailState({ text }: { text: string }) {
    return (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-500">
            {text}
        </p>
    );
}
