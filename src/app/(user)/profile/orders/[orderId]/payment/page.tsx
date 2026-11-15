// Route cũ chỉ chuyển khách về chi tiết đơn; không còn render trang thanh toán nội bộ.

import { redirect } from 'next/navigation';

import type { CustomerPay2sLegacyPaymentRedirectProps } from '../../types/customer-payment.types';

// Giữ liên kết cũ hoạt động và đưa khách tới nơi có CTA thanh toán lại trong cùng tab.
export default async function LegacyPay2sPaymentRedirect({
    params,
}: CustomerPay2sLegacyPaymentRedirectProps) {
    const { orderId } = await params;
    redirect(`/profile/orders/${orderId}`);
}
