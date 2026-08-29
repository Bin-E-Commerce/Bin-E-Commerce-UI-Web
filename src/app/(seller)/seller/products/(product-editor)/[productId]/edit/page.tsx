'use client';

import { useParams } from 'next/navigation';

import { SellerProductEditorPage } from '../../../product-editor/components/SellerProductEditorPage';

// Đọc productId từ route động và giao phần tải dữ liệu/form cho wizard dùng chung.
export default function SellerProductEditPage() {
    const params = useParams<{ productId: string }>();
    const productId = typeof params.productId === 'string' ? params.productId : undefined;

    return <SellerProductEditorPage productId={productId} />;
}
