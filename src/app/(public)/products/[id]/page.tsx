import { ProductDetailPageContent } from '../../_features/product-detail/ProductDetailPageContent';

interface ProductDetailPageProps {
    params: Promise<{ id: string }>;
}

// Đọc product ID từ dynamic route rồi chuyển cho feature chịu trách nhiệm tải và trình bày dữ liệu.
export default async function ProductDetailPage({
    params,
}: ProductDetailPageProps) {
    const { id } = await params;

    return <ProductDetailPageContent productId={id} />;
}
