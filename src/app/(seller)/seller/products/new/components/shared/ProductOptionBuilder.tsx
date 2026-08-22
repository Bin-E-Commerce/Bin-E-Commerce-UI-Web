'use client';

import { Plus, Trash2, X } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type {
    ProductCreateOption,
    SellerProductCreateFormValues,
} from '../../types/seller-product-create-form.type';

interface ProductOptionBuilderProps {
    form: UseFormReturn<SellerProductCreateFormValues>;
    options: ProductCreateOption[];
}

// Quản lý tối đa hai nhóm phân loại và các giá trị dùng để sinh ma trận SKU ở bảng bên dưới.
export function ProductOptionBuilder({
    form,
    options,
}: ProductOptionBuilderProps) {
    // Thêm nhóm với một giá trị rỗng để người dùng có điểm nhập rõ ràng ngay sau thao tác.
    const addOption = () => {
        if (options.length >= 2) return;
        form.setValue(
            'options',
            [
                ...options,
                {
                    clientId: createClientId(),
                    name: '',
                    values: [{ clientId: createClientId(), value: '' }],
                },
            ],
            { shouldDirty: true, shouldValidate: true },
        );
    };

    // Xóa cả nhóm và để hook điều phối tự tái tạo ma trận variant còn hợp lệ.
    const removeOption = (optionIndex: number) => {
        form.setValue(
            'options',
            options.filter((_, index) => index !== optionIndex),
            { shouldDirty: true, shouldValidate: true },
        );
    };

    // Thêm một lựa chọn vào nhóm hiện tại, giới hạn 20 để khớp schema backend.
    const addValue = (optionIndex: number) => {
        const option = options[optionIndex];
        if (!option || option.values.length >= 20) return;
        const next = [...options];
        next[optionIndex] = {
            ...option,
            values: [
                ...option.values,
                { clientId: createClientId(), value: '' },
            ],
        };
        form.setValue('options', next, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    // Xóa một giá trị và giữ tối thiểu một dòng nhập trong mỗi nhóm phân loại.
    const removeValue = (optionIndex: number, valueIndex: number) => {
        const option = options[optionIndex];
        if (!option || option.values.length <= 1) return;
        const next = [...options];
        next[optionIndex] = {
            ...option,
            values: option.values.filter((_, index) => index !== valueIndex),
        };
        form.setValue('options', next, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    return (
        <div className="space-y-4">
            {options.map((option, optionIndex) => (
                <div
                    key={option.clientId}
                    className="border-l-2 border-zinc-950 bg-zinc-50 px-4 py-4"
                >
                    <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                            <label
                                htmlFor={`option-${option.clientId}`}
                                className="mb-2 block text-sm font-semibold text-zinc-950"
                            >
                                Nhóm phân loại {optionIndex + 1}
                            </label>
                            <Input
                                id={`option-${option.clientId}`}
                                value={option.name}
                                placeholder="Ví dụ: Màu sắc, Kích thước"
                                className="h-10 max-w-md bg-white"
                                onChange={(event) =>
                                    form.setValue(
                                        `options.${optionIndex}.name`,
                                        event.target.value,
                                        {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                        },
                                    )
                                }
                            />
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Xóa nhóm phân loại"
                            onClick={() => removeOption(optionIndex)}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {option.values.map((optionValue, valueIndex) => (
                            <div
                                key={optionValue.clientId}
                                className="flex items-center gap-2"
                            >
                                <Input
                                    value={optionValue.value}
                                    placeholder={`Giá trị ${valueIndex + 1}`}
                                    className="h-10 bg-white"
                                    onChange={(event) =>
                                        form.setValue(
                                            `options.${optionIndex}.values.${valueIndex}.value`,
                                            event.target.value,
                                            {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            },
                                        )
                                    }
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    title="Xóa giá trị"
                                    disabled={option.values.length <= 1}
                                    onClick={() =>
                                        removeValue(optionIndex, valueIndex)
                                    }
                                >
                                    <X className="size-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        disabled={option.values.length >= 20}
                        onClick={() => addValue(optionIndex)}
                    >
                        <Plus className="size-4" />
                        Thêm giá trị
                    </Button>
                </div>
            ))}

            {options.length < 2 ? (
                <Button type="button" variant="outline" onClick={addOption}>
                    <Plus className="size-4" />
                    Thêm nhóm phân loại
                </Button>
            ) : null}
            <p className="text-xs leading-5 text-zinc-500">
                Tối đa 2 nhóm. Hệ thống tự tạo đầy đủ tổ hợp SKU từ các giá trị đã nhập.
            </p>
        </div>
    );
}

// Tạo ID chỉ dùng trong form để liên kết option value với variant trước khi backend cấp UUID thật.
function createClientId(): string {
    return crypto.randomUUID();
}
