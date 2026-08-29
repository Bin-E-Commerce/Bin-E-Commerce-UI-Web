'use client';

import type { UseFormReturn } from 'react-hook-form';

import type { CatalogCategory } from '@/services/catalog';
import type { ProductBrand } from '@/services/product';
import type { ProductCreateStepId } from '../types/product-create-step.type';
import type { SellerProductCreateFormValues, SellerProductCreateReferences } from '../types/seller-product-create-form.type';
import { ProductBasicSection } from './sections/ProductBasicSection';
import { ProductDetailsSection } from './sections/ProductDetailsSection';
import { ProductOtherSection } from './sections/ProductOtherSection';
import { ProductSalesSection } from './sections/ProductSalesSection';
import { ProductShippingSection } from './sections/ProductShippingSection';

interface ProductCreateStepContentProps {
    activeStep: ProductCreateStepId;
    form: UseFormReturn<SellerProductCreateFormValues>;
    references: SellerProductCreateReferences;
    loadingAttributes: boolean;
    onCategorySelect: (category: CatalogCategory) => void;
    onBrandSelect: (brand: ProductBrand | null) => void;
}

// Chỉ mount section đang làm để giảm chiều cao DOM, tránh cảm giác cuộn vô tận và tránh chạy lại các control nặng không cần thiết.
export function ProductCreateStepContent({
    activeStep,
    form,
    references,
    loadingAttributes,
    onCategorySelect,
    onBrandSelect,
}: ProductCreateStepContentProps) {
    switch (activeStep) {
        case 'basic':
            return (
                <ProductBasicSection
                    form={form}
                    references={references}
                    loadingAttributes={loadingAttributes}
                    onCategorySelect={onCategorySelect}
                />
            );
        case 'details':
            return (
                <ProductDetailsSection
                    form={form}
                    references={references}
                    loadingAttributes={loadingAttributes}
                    onBrandSelect={onBrandSelect}
                />
            );
        case 'sales':
            return <ProductSalesSection form={form} />;
        case 'shipping':
            return <ProductShippingSection form={form} />;
        case 'other':
            return <ProductOtherSection form={form} />;
    }

    // Nhánh dự phòng giúp component luôn trả về một node hợp lệ nếu enum bước được mở rộng.
    return null;
}
