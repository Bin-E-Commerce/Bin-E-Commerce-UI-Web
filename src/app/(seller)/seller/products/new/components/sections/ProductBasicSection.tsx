'use client';

import type { UseFormReturn } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import type { CatalogCategory } from '@/services/catalog';
import type {
    SellerProductCreateFormValues,
    SellerProductCreateReferences,
} from '../../types/seller-product-create-form.type';
import { ProductCreateSection } from '../layout/ProductCreateSection';
import { ProductCategoryPicker } from '../shared/ProductCategoryPicker';
import { ProductFormField } from '../shared/ProductFormField';
import { ProductImageUploader } from '../shared/ProductImageUploader';
import { ProductVideoUploader } from '../shared/ProductVideoUploader';

interface ProductBasicSectionProps {
    form: UseFormReturn<SellerProductCreateFormValues>;
    references: SellerProductCreateReferences;
    loadingAttributes: boolean;
    onCategorySelect: (category: CatalogCategory) => void | Promise<void>;
}

// Thu thập dữ liệu nền tảng quyết định cách sản phẩm hiển thị và những thuộc tính động cần khai báo.
export function ProductBasicSection({
    form,
    references,
    loadingAttributes,
    onCategorySelect,
}: ProductBasicSectionProps) {
    const name = form.watch('name');
    const images = form.watch('images');
    const video = form.watch('video');
    const errors = form.formState.errors;
    const imageError = typeof errors.images?.message === 'string' ? errors.images.message : undefined;

    return (
        <ProductCreateSection
            id="basic"
            title="Thông tin cơ bản"
            description="Tên, hình ảnh và ngành hàng quyết định cách sản phẩm xuất hiện trên gian hàng."
        >
            <div className="space-y-6">
                <ProductFormField
                    label="Hình ảnh sản phẩm"
                    required
                    error={imageError}
                    hint="Tải tối thiểu 2 ảnh, tối đa 9 ảnh. Ảnh đầu tiên là ảnh bìa."
                >
                    <ProductImageUploader form={form} images={images} error={imageError} />
                </ProductFormField>

                <ProductFormField
                    label="Video giới thiệu"
                    hint="Không bắt buộc. Hỗ trợ MP4 hoặc WebM, thời lượng từ 10 đến 60 giây."
                >
                    <ProductVideoUploader form={form} video={video} />
                </ProductFormField>

                <div className="grid gap-5 lg:grid-cols-2">
                    <ProductFormField
                        label="Tên sản phẩm"
                        htmlFor="product-name"
                        required
                        error={errors.name?.message}
                        hint={`${name.length}/200 ký tự; tối thiểu 20 ký tự.`}
                    >
                        <Input
                            id="product-name"
                            maxLength={200}
                            placeholder="Thương hiệu + loại sản phẩm + đặc điểm nổi bật"
                            aria-invalid={Boolean(errors.name)}
                            className="h-11"
                            {...form.register('name')}
                        />
                    </ProductFormField>

                    <ProductFormField label="Ngành hàng" required error={errors.categoryId?.message}>
                        <ProductCategoryPicker
                            value={references.category}
                            error={errors.categoryId?.message}
                            disabled={loadingAttributes}
                            onSelect={onCategorySelect}
                        />
                    </ProductFormField>
                </div>
            </div>
        </ProductCreateSection>
    );
}
