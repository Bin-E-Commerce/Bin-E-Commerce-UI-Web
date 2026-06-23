'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { ImagePlus, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { BUSINESS_MODEL_OPTIONS } from '../../constants/seller-register-options.constant';
import { useRootCategories } from '../../hooks/useRootCategories';
import type {
    SellerRegisterFieldErrors,
    SellerRegisterFormValues,
} from '../../types/seller-register-form.type';
import { Field } from '../shared/Field';
import { inputClassName, textareaClassName } from '../shared/form-control.styles';
import {
    SellerCombobox,
    type SellerComboboxOption,
} from '../shared/SellerCombobox';

interface ShopInfoStepProps {
    values: SellerRegisterFormValues['shop'];
    errors: SellerRegisterFieldErrors;
    onChange: (patch: Partial<SellerRegisterFormValues['shop']>) => void;
}

// Bước thông tin shop tập trung vào dữ liệu sẽ hiển thị công khai cho khách hàng.
export function ShopInfoStep({ values, errors, onChange }: ShopInfoStepProps) {
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
    const [logoFileName, setLogoFileName] = useState('');
    const logoInputRef = useRef<HTMLInputElement | null>(null);
    const { categories, loading, error } = useRootCategories();
    const categoryOptions = useMemo<SellerComboboxOption[]>(
        () =>
            categories.map((category) => ({
                value: category.id,
                label: category.name,
            })),
        [categories],
    );

    useEffect(() => {
        return () => {
            if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
        };
    }, [logoPreviewUrl]);

    // Tạo preview local để người bán kiểm tra logo trước khi hồ sơ thật sự được lưu/upload.
    const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
        setLogoPreviewUrl(URL.createObjectURL(file));
        setLogoFileName(file.name);
    };

    // Cho phép bỏ ảnh đã chọn và reset input file để người dùng chọn lại cùng một file nếu cần.
    const clearLogo = () => {
        if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
        setLogoPreviewUrl(null);
        setLogoFileName('');
        if (logoInputRef.current) logoInputRef.current.value = '';
    };

    return (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_220px]">
            <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <Field
                    label="Tên shop"
                    htmlFor="shopName"
                    error={errors['shop.name']}
                >
                    <Input
                        id="shopName"
                        value={values.name}
                        className={inputClassName}
                        placeholder="Ví dụ: Bin Tech Store"
                        onChange={(event) =>
                            onChange({ name: event.target.value })
                        }
                    />
                </Field>
                <Field
                    label="Đường dẫn shop"
                    htmlFor="shopSlug"
                    error={errors['shop.slug']}
                >
                    <Input
                        id="shopSlug"
                        value={values.slug}
                        className={inputClassName}
                        placeholder="bin-tech-store"
                        onChange={(event) =>
                            onChange({ slug: event.target.value })
                        }
                    />
                </Field>
                <Field
                    label="Ngành hàng chính"
                    htmlFor="mainCategory"
                    error={errors['shop.mainCategoryId'] ?? error ?? undefined}
                >
                    <SellerCombobox
                        id="mainCategory"
                        value={values.mainCategoryId}
                        options={categoryOptions}
                        placeholder="Tìm hoặc chọn ngành hàng"
                        emptyMessage="Không tìm thấy ngành hàng phù hợp."
                        loading={loading}
                        disabled={Boolean(error)}
                        onValueChange={(mainCategoryId) =>
                            onChange({ mainCategoryId })
                        }
                    />
                </Field>
                <Field
                    label="Mô hình bán hàng"
                    htmlFor="businessModel"
                    error={errors['shop.businessModel']}
                >
                    <SellerCombobox
                        id="businessModel"
                        value={values.businessModel}
                        options={BUSINESS_MODEL_OPTIONS}
                        placeholder="Chọn mô hình bán hàng"
                        onValueChange={(businessModel) =>
                            onChange({ businessModel })
                        }
                    />
                </Field>
                <div className="sm:col-span-2">
                    <Field
                        label="Mô tả shop"
                        htmlFor="shopDescription"
                        error={errors['shop.description']}
                    >
                        <textarea
                            id="shopDescription"
                            value={values.description}
                            className={textareaClassName}
                            placeholder="Giới thiệu ngắn gọn về sản phẩm, cam kết dịch vụ và điểm mạnh của shop."
                            onChange={(event) =>
                                onChange({ description: event.target.value })
                            }
                        />
                    </Field>
                </div>
            </div>

            <div className="self-start rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4">
                <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white">
                    {logoPreviewUrl ? (
                        <img
                            src={logoPreviewUrl}
                            alt="Logo shop đã chọn"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <ImagePlus className="size-8 text-zinc-400" />
                    )}
                    {logoPreviewUrl ? (
                        <button
                            type="button"
                            aria-label="Xóa logo đã chọn"
                            onClick={clearLogo}
                            className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm transition-colors hover:bg-white hover:text-zinc-950"
                        >
                            <X className="size-4" />
                        </button>
                    ) : null}
                </div>
                <p className="mt-3 text-sm font-semibold text-zinc-950">
                    Logo shop
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Ưu tiên ảnh vuông, nền rõ, không chứa thông tin liên hệ
                    ngoài nền tảng.
                </p>
                {logoFileName ? (
                    <p className="mt-2 truncate text-xs text-zinc-600">
                        {logoFileName}
                    </p>
                ) : null}
                <input
                    ref={logoInputRef}
                    id="shopLogo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={handleLogoChange}
                />
                <label
                    htmlFor="shopLogo"
                    className="mt-3 inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-full border border-input bg-background px-3 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                    {logoPreviewUrl ? 'Đổi ảnh' : 'Chọn ảnh'}
                </label>
            </div>
        </div>
    );
}
