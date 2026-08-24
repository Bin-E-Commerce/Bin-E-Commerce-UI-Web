'use client';

import type { UseFormReturn } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { SellerProductCreateFormValues } from '../../types/seller-product-create-form.type';
import { ProductCreateSection } from '../layout/ProductCreateSection';
import { ProductFormField } from '../shared/ProductFormField';

interface ProductOtherSectionProps {
    form: UseFormReturn<SellerProductCreateFormValues>;
}

const conditions = [
    { value: 'new', label: 'Mới' },
    { value: 'used_like_new', label: 'Đã qua sử dụng - như mới' },
    { value: 'used_good', label: 'Đã qua sử dụng - tốt' },
] as const;

// Thu thập thông tin bổ sung để vận hành catalog nhất quán mà không làm phức tạp phần SKU.
export function ProductOtherSection({ form }: ProductOtherSectionProps) {
    const condition = form.watch('condition');
    const errors = form.formState.errors;

    return (
        <ProductCreateSection
            id="other"
            title="Thông tin khác"
            description="Bổ sung tình trạng, xuất xứ và mã quản lý để vận hành sản phẩm nhất quán."
        >
            <div className="space-y-6">
                <ProductFormField label="Tình trạng" required error={errors.condition?.message}>
                    <div className="flex flex-wrap gap-2">
                        {conditions.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                className={cn(
                                    'h-10 rounded-md border px-4 text-sm transition-colors',
                                    condition === item.value
                                        ? 'border-zinc-950 bg-zinc-950 text-white'
                                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400',
                                )}
                                onClick={() => form.setValue('condition', item.value, { shouldDirty: true, shouldValidate: true })}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </ProductFormField>

                <div className="grid gap-5 lg:grid-cols-3">
                    <ProductFormField label="Xuất xứ" htmlFor="product-origin" error={errors.countryOfOrigin?.message}>
                        <Input id="product-origin" maxLength={120} placeholder="Ví dụ: Việt Nam" className="h-11" {...form.register('countryOfOrigin')} />
                    </ProductFormField>
                    <ProductFormField label="SKU sản phẩm" htmlFor="product-seller-sku" error={errors.sellerSku?.message}>
                        <Input id="product-seller-sku" maxLength={160} placeholder="Mã quản lý nội bộ" className="h-11" {...form.register('sellerSku')} />
                    </ProductFormField>
                    <ProductFormField label="GTIN dùng chung" htmlFor="product-gtin" error={errors.gtin?.message} hint="Để trống nếu mỗi SKU có mã riêng hoặc không có GTIN.">
                        <Input id="product-gtin" inputMode="numeric" maxLength={14} placeholder="8, 12, 13 hoặc 14 chữ số" aria-invalid={Boolean(errors.gtin)} className="h-11" {...form.register('gtin', { onChange: (event) => { event.target.value = event.target.value.replace(/\D/g, ''); } })} />
                    </ProductFormField>
                </div>
            </div>
        </ProductCreateSection>
    );
}
