// Utility này giữ attribution ngắn hạn giữa recommendation card và CTA add-to-cart ở trang chi tiết.
// Nó không lưu user identity, không gọi API và không được dùng làm nguồn xác thực; backend vẫn verify chữ ký và actor.

import type { RecommendationAttributionContext } from './types/recommendation.types';

const ATTRIBUTION_KEY_PREFIX = 'bin-ecommerce:recommendation-attribution:v1:';
const ATTRIBUTION_TTL_MS = 30 * 60 * 1000;

interface StoredAttribution {
    productId: string;
    context: RecommendationAttributionContext;
    storedAt: number;
}

// Lưu context của card vừa được click theo product để request add-to-cart sau đó vẫn đo được conversion recommendation.
// Chỉ lưu context đầy đủ và có thời hạn; card listing thông thường không tạo record nên không làm bẩn recommendation analytics.
export function rememberRecommendationAttribution(
    productId: string,
    context?: RecommendationAttributionContext,
): void {
    if (typeof window === 'undefined' || !context?.recommendationRequestId)
        return;

    const value: StoredAttribution = {
        productId,
        context,
        storedAt: Date.now(),
    };
    window.sessionStorage.setItem(
        `${ATTRIBUTION_KEY_PREFIX}${productId}`,
        JSON.stringify(value),
    );
}

// Đọc attribution còn hạn cho đúng product; dữ liệu hỏng hoặc quá hạn bị xóa để không gửi token cũ lên backend.
export function getStoredRecommendationAttribution(
    productId: string,
): RecommendationAttributionContext | undefined {
    if (typeof window === 'undefined') return undefined;

    const key = `${ATTRIBUTION_KEY_PREFIX}${productId}`;
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return undefined;

    try {
        const stored = JSON.parse(raw) as StoredAttribution;
        if (
            stored.productId !== productId ||
            !Number.isFinite(stored.storedAt) ||
            Date.now() - stored.storedAt > ATTRIBUTION_TTL_MS ||
            !stored.context?.recommendationRequestId ||
            !stored.context.recommendationItemId
        ) {
            window.sessionStorage.removeItem(key);
            return undefined;
        }
        return stored.context;
    } catch {
        window.sessionStorage.removeItem(key);
        return undefined;
    }
}

// Xóa attribution sau khi backend đã nhận event thành công để một click không bị tính lặp cho nhiều lần add-to-cart.
export function clearRecommendationAttribution(productId: string): void {
    if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(
            `${ATTRIBUTION_KEY_PREFIX}${productId}`,
        );
    }
}
