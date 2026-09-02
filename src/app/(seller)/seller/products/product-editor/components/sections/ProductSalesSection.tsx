'use client';

import type { UseFormReturn } from 'react-hook-form';

import type { SellerProductCreateFormValues } from '../../types/seller-product-create-form.type';
import { ProductCreateSection } from '../layout/ProductCreateSection';
import { ProductOptionBuilder } from '../shared/ProductOptionBuilder';
import { ProductVariantBulkEditor } from '../shared/ProductVariantBulkEditor';
import { ProductVariantTable } from '../shared/ProductVariantTable';

interface ProductSalesSectionProps {
    form: UseFormReturn<SellerProductCreateFormValues>;
}

// Quản lý phân loại và SKU; mỗi tổ hợp option sẽ tương ứng một đơn vị có thể bán.
export function ProductSalesSection({ form }: ProductSalesSectionProps) {
    const options = form.watch('options');
    const variants = form.watch('variants');
    const optionError = form.formState.errors.options?.message;

    return (
        <ProductCreateSection
            id="sales"
            title="Thông tin bán hàng"
            description="Thiết lập phân loại, giá bán, số lượng tồn và mã định danh của từng SKU."
        >
            <div className="space-y-7">
                <div>
                    <h3 className="mb-3 text-sm font-semibold text-zinc-950">
                        Phân loại hàng
                    </h3>
                    <ProductOptionBuilder form={form} options={options} />
                    {typeof optionError === 'string' ? (
                        <p className="mt-2 text-xs text-red-600">
                            {optionError}
                        </p>
                    ) : null}
                </div>

                <div className="border-t border-zinc-200 pt-6">
                    <h3 className="text-sm font-semibold text-zinc-950">
                        Danh sách SKU
                    </h3>
                    <p className="mb-3 mt-1 text-xs text-zinc-500">
                        {variants.length} phân loại có thể bán · Kho khả dụng là
                        số lượng đang bán được ngay
                    </p>
                    <ProductVariantBulkEditor
                        form={form}
                        variantCount={variants.length}
                    />
                    <ProductVariantTable form={form} variants={variants} />
                </div>
            </div>
        </ProductCreateSection>
    );
}
