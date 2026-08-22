'use client';

import { useState } from 'react';
import { ListChecks } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { SellerProductCreateFormValues } from '../../types/seller-product-create-form.type';

interface ProductVariantBulkEditorProps {
    form: UseFormReturn<SellerProductCreateFormValues>;
    variantCount: number;
}

// Cho phép áp dụng giá và tồn kho chung cho toàn bộ ma trận SKU để giảm thao tác lặp khi nhiều phân loại đồng giá.
export function ProductVariantBulkEditor({
    form,
    variantCount,
}: ProductVariantBulkEditorProps) {
    const [price, setPrice] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [stockQuantity, setStockQuantity] = useState('');

    // Chỉ ghi các ô seller đã nhập; giá trị trống không xóa dữ liệu riêng đang có trên từng SKU.
    const applyToAllVariants = () => {
        const variants = form.getValues('variants');
        form.setValue(
            'variants',
            variants.map((variant) => ({
                ...variant,
                price: price || variant.price,
                originalPrice: originalPrice || variant.originalPrice,
                stockQuantity: stockQuantity || variant.stockQuantity,
            })),
            { shouldDirty: true, shouldValidate: true },
        );
    };

    return (
        <div className="mb-4 grid gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
            <Input
                type="number"
                min="100"
                value={price}
                placeholder="Giá bán chung"
                onChange={(event) => setPrice(event.target.value)}
            />
            <Input
                type="number"
                min="0"
                value={originalPrice}
                placeholder="Giá gốc chung"
                onChange={(event) => setOriginalPrice(event.target.value)}
            />
            <Input
                type="number"
                min="0"
                step="1"
                value={stockQuantity}
                placeholder="Tồn kho chung"
                onChange={(event) => setStockQuantity(event.target.value)}
            />
            <Button
                type="button"
                variant="outline"
                disabled={variantCount === 0 || (!price && !originalPrice && !stockQuantity)}
                onClick={applyToAllVariants}
            >
                <ListChecks className="size-4" />
                Áp dụng tất cả
            </Button>
        </div>
    );
}
