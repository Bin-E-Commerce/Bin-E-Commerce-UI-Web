// File này chỉ lắp checkout feature vào public route; toàn bộ UI và state nằm trong feature folder.

import { Suspense } from 'react';
import { CheckoutPageContent } from '@/app/(public)/checkout/components/checkout-page/CheckoutPageContent';
import {
    CheckoutLoadingSkeleton,
} from '@/app/(public)/checkout/components/checkout-page/CheckoutStateViews';

// Trang checkout dành cho người mua; Suspense cũng dùng skeleton trong lúc đọc query string.
export default function CheckoutPage() {
    // Component đọc query string được bao trong Suspense và dùng cùng skeleton với trạng thái tải dữ liệu.
    return (
        <Suspense fallback={<CheckoutLoadingSkeleton />}>
            <CheckoutPageContent />
        </Suspense>
    );
}
