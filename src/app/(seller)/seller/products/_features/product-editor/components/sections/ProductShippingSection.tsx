'use client';

import { Box, Ruler, Truck } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import type { SellerProductCreateFormValues } from '../../types/seller-product-create-form.type';
import { ProductCreateSection } from '../layout/ProductCreateSection';
import { ProductFormField } from '../shared/ProductFormField';

interface ProductShippingSectionProps {
    form: UseFormReturn<SellerProductCreateFormValues>;
}

// Thu thập thông số đóng gói để Shipping Service tính kênh, phí và điều kiện giao hàng ở giai đoạn sau.
export function ProductShippingSection({ form }: ProductShippingSectionProps) {
    const errors = form.formState.errors.package;

    return (
        <ProductCreateSection
            id="shipping"
            title="Vận chuyển"
            description="Khai báo thông số sau khi đóng gói. Kênh giao hàng sẽ được đề xuất theo kiện hàng và địa chỉ lấy hàng của shop."
        >
            <div className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    <PackageInput form={form} name="weightGrams" label="Cân nặng sau đóng gói" unit="g" error={errors?.weightGrams?.message} />
                    <PackageInput form={form} name="lengthCm" label="Chiều dài" unit="cm" error={errors?.lengthCm?.message} />
                    <PackageInput form={form} name="widthCm" label="Chiều rộng" unit="cm" error={errors?.widthCm?.message} />
                    <PackageInput form={form} name="heightCm" label="Chiều cao" unit="cm" error={errors?.heightCm?.message} />
                </div>

                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-sm font-semibold text-zinc-950">Điều kiện mở kênh vận chuyển</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <ShippingReadiness icon={Box} title="Kiện hàng" description="Cân nặng và kích thước thực tế sau khi đóng gói." />
                        <ShippingReadiness icon={Ruler} title="Khả năng nhận hàng" description="Đối chiếu giới hạn kích thước, khối lượng của từng đối tác." />
                        <ShippingReadiness icon={Truck} title="Phương án giao" description="Ước tính phí và thời gian từ địa chỉ lấy hàng mặc định của shop." />
                    </div>
                    <p className="mt-4 border-t border-zinc-200 pt-3 text-xs leading-5 text-zinc-500">
                        Danh sách hãng giao hàng, phí và thời gian dự kiến sẽ chỉ hiển thị khi Shipping Service trả về phương án phù hợp.
                    </p>
                </div>
            </div>
        </ProductCreateSection>
    );
}

interface PackageInputProps {
    form: UseFormReturn<SellerProductCreateFormValues>;
    name: keyof SellerProductCreateFormValues['package'];
    label: string;
    unit: string;
    error?: string;
}

// Ghép ô nhập số và đơn vị nhưng vẫn lưu đúng field path của React Hook Form.
function PackageInput({ form, name, label, unit, error }: PackageInputProps) {
    return (
        <ProductFormField label={label} required error={error}>
            <div className="flex">
                <Input type="number" min="0.01" step="any" aria-invalid={Boolean(error)} className="h-11 rounded-r-none" {...form.register(`package.${name}`)} />
                <span className="flex h-11 min-w-12 items-center justify-center rounded-r-md border border-l-0 border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-500">{unit}</span>
            </div>
        </ProductFormField>
    );
}

interface ShippingReadinessProps {
    icon: typeof Box;
    title: string;
    description: string;
}

// Mô tả contract tương lai của Shipping Service mà không hard-code hãng vận chuyển hay mức phí chưa tồn tại.
function ShippingReadiness({ icon: Icon, title, description }: ShippingReadinessProps) {
    return (
        <div className="flex gap-3">
            <Icon className="mt-0.5 size-4 shrink-0 text-zinc-700" />
            <div>
                <p className="text-sm font-medium text-zinc-950">{title}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
            </div>
        </div>
    );
}
