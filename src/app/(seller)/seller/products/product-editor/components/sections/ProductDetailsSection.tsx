'use client';

import type { UseFormReturn } from 'react-hook-form';

import { Textarea } from '@/components/ui/textarea';
import type { ProductBrand } from '@/services/product';
import type {
    SellerProductCreateFormValues,
    SellerProductCreateReferences,
} from '../../types/seller-product-create-form.type';
import { ProductCreateSection } from '../layout/ProductCreateSection';
import { ProductAttributeFields } from '../shared/ProductAttributeFields';
import { ProductBrandCombobox } from '../shared/ProductBrandCombobox';
import { ProductFormField } from '../shared/ProductFormField';
import { ProductDescriptionEditor } from '../../assistants/product-description-assistant/components/ProductDescriptionEditor';

interface ProductDetailsSectionProps {
    form: UseFormReturn<SellerProductCreateFormValues>;
    references: SellerProductCreateReferences;
    loadingAttributes: boolean;
    onBrandSelect: (brand: ProductBrand | null) => void;
}

// Gom thương hiệu, thuộc tính và mô tả để người bán bổ sung thông tin giúp tìm kiếm và lọc sản phẩm.
export function ProductDetailsSection({
    form,
    references,
    loadingAttributes,
    onBrandSelect,
}: ProductDetailsSectionProps) {
    const shortDescription = form.watch('shortDescription');
    const errors = form.formState.errors;

    return (
        <ProductCreateSection
            id="details"
            title="Thông tin chi tiết"
            description="Thông số thay đổi theo ngành hàng đã chọn và được dùng cho tìm kiếm, bộ lọc."
        >
            <div className="space-y-7">
                <div className="grid gap-5 lg:grid-cols-2">
                    <ProductFormField label="Thương hiệu">
                        <ProductBrandCombobox
                            value={references.brand}
                            onSelect={onBrandSelect}
                        />
                    </ProductFormField>
                    <ProductFormField
                        label="Mô tả ngắn"
                        htmlFor="product-short-description"
                        error={errors.shortDescription?.message}
                        hint={`${shortDescription.length}/500 ký tự`}
                    >
                        <Textarea
                            id="product-short-description"
                            maxLength={500}
                            rows={3}
                            placeholder="Tóm tắt lợi ích và điểm nổi bật của sản phẩm"
                            aria-invalid={Boolean(errors.shortDescription)}
                            {...form.register('shortDescription')}
                        />
                    </ProductFormField>
                </div>

                <div className="border-t border-zinc-200 pt-6">
                    <h3 className="mb-2 text-sm font-semibold text-zinc-950">
                        Thuộc tính ngành hàng
                    </h3>
                    <p className="mb-4 text-sm text-zinc-500">
                        Chọn giá trị phù hợp để khách hàng dễ tìm và lọc sản phẩm.
                    </p>
                    <ProductAttributeFields
                        form={form}
                        attributes={references.attributes}
                        loading={loadingAttributes}
                    />
                </div>

                <ProductDescriptionEditor form={form} references={references} />
            </div>
        </ProductCreateSection>
    );
}
