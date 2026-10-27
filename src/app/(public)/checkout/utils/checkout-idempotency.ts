// File này quản lý idempotency key ở ranh giới checkout của browser.
// Key được giữ qua reload/lỗi mạng cho cùng cart snapshot, nhưng không ảnh hưởng API contract.

import type {
    CheckoutOrderMutationInput,
    StoredCheckoutIdempotencyKey,
} from '../types/checkout.types';

const inMemoryKeys = new Map<string, StoredCheckoutIdempotencyKey>();

// Tạo scope riêng theo account và dòng mua ngay để các checkout độc lập không dùng chung key.
function getStorageScope(
    userId: string,
    input: CheckoutOrderMutationInput,
): string {
    return `checkout-order:${userId}:${input.order.cartItemId ?? 'cart'}`;
}

// Chuẩn hóa đúng dữ liệu ảnh hưởng đến ý định đặt hàng, bao gồm cả snapshot item hiện tại.
function getRequestSignature(input: CheckoutOrderMutationInput): string {
    return JSON.stringify({
        ...input.order,
        note: input.order.note?.trim() ?? '',
        cartFingerprint: input.cartFingerprint,
    });
}

// Sinh định danh đủ duy nhất cho request; dùng getRandomValues khi browser chưa có randomUUID.
function createIdempotencyKey(): string {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();

    if (typeof crypto.getRandomValues === 'function') {
        const bytes = crypto.getRandomValues(new Uint8Array(16));
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = [...bytes].map((value) =>
            value.toString(16).padStart(2, '0'),
        );
        return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
    }

    // Fallback chỉ để giữ idempotency ở browser rất cũ; server vẫn giới hạn key theo owner.
    return `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Dùng lại key khi cùng checkout được gửi lại sau timeout; key hết hạn theo vòng đời đơn Pay2S.
export function getCheckoutIdempotencyKey(
    userId: string,
    input: CheckoutOrderMutationInput,
): string {
    const scope = getStorageScope(userId, input);
    const signature = getRequestSignature(input);
    const now = Date.now();

    try {
        const serialized = window.sessionStorage.getItem(scope);
        const stored = serialized
            ? (JSON.parse(serialized) as StoredCheckoutIdempotencyKey)
            : null;
        if (
            stored?.signature === signature &&
            stored.expiresAt > now &&
            stored.key
        ) {
            return stored.key;
        }

        const next: StoredCheckoutIdempotencyKey = {
            key: createIdempotencyKey(),
            signature,
            // Order Service hết hạn Pay2S sau 15 phút; thêm một phút để tránh tái dùng key sát deadline.
            expiresAt: now + 16 * 60_000,
        };
        window.sessionStorage.setItem(scope, JSON.stringify(next));
        return next.key;
    } catch {
        // Khi storage bị chặn, map trong module vẫn chống tạo đơn lặp trong vòng đời tab hiện tại.
        const stored = inMemoryKeys.get(scope);
        if (
            stored?.signature === signature &&
            stored.expiresAt > now &&
            stored.key
        ) {
            return stored.key;
        }
        const next: StoredCheckoutIdempotencyKey = {
            key: createIdempotencyKey(),
            signature,
            expiresAt: now + 16 * 60_000,
        };
        inMemoryKeys.set(scope, next);
        return next.key;
    }
}
