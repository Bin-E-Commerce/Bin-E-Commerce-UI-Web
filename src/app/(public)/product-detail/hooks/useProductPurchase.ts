'use client';

import { useState } from 'react';

import type { ProductDetail, ProductVariant } from '@/services/product';
import type { ProductPurchaseState } from '../types/product-detail.types';

// Tạo map option-value ban đầu từ variant có thể bán đầu tiên để UI luôn đồng bộ với SKU đang hiển thị.
function getInitialValueIds(
    variant: ProductVariant | null,
): Record<string, string> {
    if (!variant) return {};

    return Object.fromEntries(
        variant.optionChoices.map((choice) => [
            choice.optionValue.option.id,
            choice.optionValueId,
        ]),
    );
}

// Kiểm tra variant có chứa toàn bộ lựa chọn hiện tại; lựa chọn chưa đủ vẫn cho phép tìm SKU tương thích gần nhất.
function matchesSelectedValues(
    variant: ProductVariant,
    selectedValueIds: Record<string, string>,
): boolean {
    const variantValueIds = new Set(
        variant.optionChoices.map((choice) => choice.optionValueId),
    );

    return Object.values(selectedValueIds).every((valueId) =>
        variantValueIds.has(valueId),
    );
}

// Dùng đúng số lượng có thể bán sau khi trừ các sản phẩm đang được giữ cho đơn khác.
function getAvailableStock(variant: ProductVariant | null): number {
    return Math.max(0, variant?.inventory?.quantityAvailable ?? 0);
}

// Quản lý lựa chọn SKU và số lượng, đồng thời chặn số lượng vượt quá tồn kho của variant hiện tại.
export function useProductPurchase(
    product: ProductDetail,
): ProductPurchaseState {
    const sellableVariants = product.variants.filter(
        (variant) => variant.status === 'ACTIVE',
    );
    const initialVariant =
        sellableVariants.find((variant) => getAvailableStock(variant) > 0) ??
        sellableVariants[0] ??
        null;
    const [selectedVariant, setSelectedVariant] =
        useState<ProductVariant | null>(initialVariant);
    const [selectedValueIds, setSelectedValueIds] = useState<
        Record<string, string>
    >(() => getInitialValueIds(initialVariant));
    const [quantity, setQuantityState] = useState(1);
    const availableStock = getAvailableStock(selectedVariant);

    // Cập nhật một nhóm option rồi tìm variant khớp toàn bộ lựa chọn để giá và tồn kho đổi cùng lúc.
    function selectOptionValue(optionId: string, valueId: string): void {
        const nextValueIds = { ...selectedValueIds, [optionId]: valueId };
        const nextVariant =
            sellableVariants.find((variant) =>
                matchesSelectedValues(variant, nextValueIds),
            ) ?? null;

        setSelectedValueIds(nextValueIds);
        setSelectedVariant(nextVariant);
        setQuantityState(1);
    }

    // Giảm số lượng nhưng luôn giữ tối thiểu một sản phẩm.
    function decreaseQuantity(): void {
        setQuantityState((current) => Math.max(1, current - 1));
    }

    // Tăng số lượng đến tối đa tồn kho hiện tại để không tạo lựa chọn không thể mua.
    function increaseQuantity(): void {
        setQuantityState((current) =>
            Math.min(Math.max(1, availableStock), current + 1),
        );
    }

    // Chuẩn hóa giá trị nhập trực tiếp từ ô số lượng vào khoảng hợp lệ của SKU.
    function setQuantity(nextQuantity: number): void {
        const safeQuantity = Number.isFinite(nextQuantity)
            ? Math.trunc(nextQuantity)
            : 1;
        setQuantityState(
            Math.min(Math.max(1, availableStock), Math.max(1, safeQuantity)),
        );
    }

    return {
        selectedVariant,
        selectedValueIds,
        quantity,
        availableStock,
        selectOptionValue,
        decreaseQuantity,
        increaseQuantity,
        setQuantity,
    };
}
