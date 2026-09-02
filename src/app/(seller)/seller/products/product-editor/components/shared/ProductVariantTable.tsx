'use client';

import type { UseFormReturn } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type { SellerProductCreateFormValues } from '../../types/seller-product-create-form.type';

interface ProductVariantTableProps {
    form: UseFormReturn<SellerProductCreateFormValues>;
    variants: SellerProductCreateFormValues['variants'];
}

// Hiển thị từng tổ hợp phân loại để seller nhập giá, tồn kho, SKU và GTIN ở cấp có thể bán.
export function ProductVariantTable({
    form,
    variants,
}: ProductVariantTableProps) {
    return (
        <div className="overflow-x-auto rounded-md border border-zinc-200">
            <table className="w-full min-w-[920px] border-collapse text-sm">
                <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                    <tr>
                        <th className="w-44 px-3 py-3">Phân loại</th>
                        <th className="w-36 px-3 py-3">Giá bán *</th>
                        <th className="w-36 px-3 py-3">Giá gốc</th>
                        <th className="w-28 px-3 py-3">Kho khả dụng *</th>
                        <th className="w-40 px-3 py-3">SKU</th>
                        <th className="w-44 px-3 py-3">GTIN</th>
                        <th className="w-36 px-3 py-3">Không có GTIN</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                    {variants.map((variant, index) => {
                        const errors = form.formState.errors.variants?.[index];
                        return (
                            <tr key={variant.key} className="align-top">
                                <td className="px-3 py-4 font-medium text-zinc-950">
                                    {variant.label}
                                </td>
                                <td className="px-3 py-3">
                                    <Input
                                        type="number"
                                        min="100"
                                        value={variant.price}
                                        aria-invalid={Boolean(errors?.price)}
                                        placeholder="0"
                                        onChange={(event) =>
                                            updateVariantTextField(
                                                form,
                                                index,
                                                'price',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <FieldError
                                        message={errors?.price?.message}
                                    />
                                </td>
                                <td className="px-3 py-3">
                                    <Input
                                        type="number"
                                        min="0"
                                        value={variant.originalPrice}
                                        placeholder="Không bắt buộc"
                                        onChange={(event) =>
                                            updateVariantTextField(
                                                form,
                                                index,
                                                'originalPrice',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <FieldError
                                        message={errors?.originalPrice?.message}
                                    />
                                </td>
                                <td className="px-3 py-3">
                                    <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={variant.stockQuantity}
                                        aria-invalid={Boolean(
                                            errors?.stockQuantity,
                                        )}
                                        onChange={(event) =>
                                            updateVariantTextField(
                                                form,
                                                index,
                                                'stockQuantity',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <FieldError
                                        message={errors?.stockQuantity?.message}
                                    />
                                </td>
                                <td className="px-3 py-3">
                                    <Input
                                        value={variant.sku}
                                        placeholder="SKU nội bộ"
                                        onChange={(event) =>
                                            updateVariantTextField(
                                                form,
                                                index,
                                                'sku',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </td>
                                <td className="px-3 py-3">
                                    <Input
                                        inputMode="numeric"
                                        disabled={variant.withoutGtin}
                                        value={variant.gtin}
                                        aria-invalid={Boolean(errors?.gtin)}
                                        placeholder="8, 12, 13 hoặc 14 số"
                                        onChange={(event) =>
                                            updateVariantTextField(
                                                form,
                                                index,
                                                'gtin',
                                                event.target.value.replace(
                                                    /\D/g,
                                                    '',
                                                ),
                                            )
                                        }
                                    />
                                    <FieldError
                                        message={errors?.gtin?.message}
                                    />
                                </td>
                                <td className="px-3 py-4">
                                    <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-600">
                                        <Checkbox
                                            checked={variant.withoutGtin}
                                            onCheckedChange={(checked) => {
                                                updateVariantBooleanField(
                                                    form,
                                                    index,
                                                    'withoutGtin',
                                                    checked,
                                                );
                                                if (checked) {
                                                    updateVariantTextField(
                                                        form,
                                                        index,
                                                        'gtin',
                                                        '',
                                                    );
                                                }
                                            }}
                                        />
                                        Không có mã
                                    </label>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// Ghi một field variant và yêu cầu React Hook Form kiểm tra lại dòng đang sửa.
function updateVariantTextField(
    form: UseFormReturn<SellerProductCreateFormValues>,
    index: number,
    field: 'price' | 'originalPrice' | 'stockQuantity' | 'sku' | 'gtin',
    value: string,
) {
    // Tách từng path cụ thể để React Hook Form kiểm tra đúng kiểu thay vì làm mất an toàn bằng ép `any`.
    if (field === 'price') {
        form.setValue(`variants.${index}.price`, value, {
            shouldDirty: true,
            shouldValidate: true,
        });
    } else if (field === 'originalPrice') {
        form.setValue(`variants.${index}.originalPrice`, value, {
            shouldDirty: true,
            shouldValidate: true,
        });
    } else if (field === 'stockQuantity') {
        form.setValue(`variants.${index}.stockQuantity`, value, {
            shouldDirty: true,
            shouldValidate: true,
        });
    } else if (field === 'sku') {
        form.setValue(`variants.${index}.sku`, value, {
            shouldDirty: true,
            shouldValidate: true,
        });
    } else {
        form.setValue(`variants.${index}.gtin`, value, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }
}

// Cập nhật cờ GTIN riêng vì field boolean không thể dùng chung an toàn với các input chuỗi phía trên.
function updateVariantBooleanField(
    form: UseFormReturn<SellerProductCreateFormValues>,
    index: number,
    field: 'withoutGtin',
    value: boolean,
) {
    form.setValue(`variants.${index}.${field}`, value, {
        shouldDirty: true,
        shouldValidate: true,
    });
}

// Giữ chiều cao lỗi gọn trong từng ô và chỉ render khi schema trả message.
function FieldError({ message }: { message?: string }) {
    return message ? (
        <p className="mt-1 text-[11px] leading-4 text-red-600">{message}</p>
    ) : null;
}
