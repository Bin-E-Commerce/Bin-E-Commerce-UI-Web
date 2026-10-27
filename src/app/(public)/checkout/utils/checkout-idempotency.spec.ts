// Test bảo vệ hợp đồng retry: cùng cart snapshot phải dùng lại key, cart đổi phải tạo key mới.

import { getCheckoutIdempotencyKey } from './checkout-idempotency';
import type { CheckoutOrderMutationInput } from '../types/checkout.types';

describe('getCheckoutIdempotencyKey', () => {
    beforeEach(() => {
        window.sessionStorage.clear();
    });

    // Cùng payload và cùng snapshot phải sống sót qua lần gọi lại sau timeout/reload.
    it('should reuse the key for the same checkout intent', () => {
        // Arrange
        const input: CheckoutOrderMutationInput = {
            order: {
                shippingAddressId: 'address-1',
                cartItemId: 'cart-item-1',
                paymentMethod: 'PAY2S',
            },
            cartFingerprint: '[{"id":"cart-item-1","quantity":1}]',
        };

        // Act
        const firstKey = getCheckoutIdempotencyKey('customer-1', input);
        const retryKey = getCheckoutIdempotencyKey('customer-1', input);

        // Assert
        expect(retryKey).toBe(firstKey);
        expect(window.sessionStorage.length).toBe(1);
    });

    // Đổi cart snapshot phải tách ý định mới để không nhận lại order cũ với số lượng khác.
    it('should create a new key when cart contents change', () => {
        // Arrange
        const input: CheckoutOrderMutationInput = {
            order: {
                shippingAddressId: 'address-1',
                paymentMethod: 'PAY2S',
            },
            cartFingerprint: '[{"id":"item-1","quantity":1}]',
        };
        const changedInput: CheckoutOrderMutationInput = {
            ...input,
            cartFingerprint: '[{"id":"item-1","quantity":2}]',
        };

        // Act
        const firstKey = getCheckoutIdempotencyKey('customer-1', input);
        const changedKey = getCheckoutIdempotencyKey(
            'customer-1',
            changedInput,
        );

        // Assert
        expect(changedKey).not.toBe(firstKey);
    });
});
