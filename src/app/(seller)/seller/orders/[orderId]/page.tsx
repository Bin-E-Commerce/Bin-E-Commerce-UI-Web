// Page route mỏng cho detail Seller; dữ liệu và trạng thái hiển thị nằm trong feature component.

'use client';

import { useParams } from 'next/navigation';

import { SellerOrderDetailContent } from '../components/seller-order-detail-content';

// Đọc orderId từ URL để refresh trực tiếp vẫn giữ nguyên scope detail Seller.
export default function SellerOrderDetailPage() {
    const params = useParams<{ orderId: string }>();
    return <SellerOrderDetailContent orderId={params.orderId} />;
}
