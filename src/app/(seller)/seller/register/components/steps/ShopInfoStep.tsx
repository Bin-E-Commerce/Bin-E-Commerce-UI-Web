'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { mediaService, type MediaUploadMimeType } from '@/services/media';
import type { PresignedUploadResponse } from '@/services/media';
import { getErrorMessage } from '@/utils/getErrorMessage';
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

const SHOP_LOGO_MIME_TYPES = new Set<MediaUploadMimeType>([
    'image/jpeg',
    'image/png',
    'image/webp',
]);

// Bước thông tin shop tập trung vào dữ liệu sẽ hiển thị công khai cho khách hàng.
export function ShopInfoStep({ values, errors, onChange }: ShopInfoStepProps) {
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
    const [logoFileName, setLogoFileName] = useState('');
    const [logoUploadProgress, setLogoUploadProgress] = useState(0);
    const [logoUploading, setLogoUploading] = useState(false);
    const logoInputRef = useRef<HTMLInputElement | null>(null);
    const logoUploadRequestRef = useRef(0);
    const { categories, loading, error } = useRootCategories();
    const categoryOptions = useMemo<SellerComboboxOption[]>(
        () =>
            categories.map((category) => ({
                value: category.id,
                label: category.name,
            })),
        [categories],
    );
    const logoImageUrl = logoPreviewUrl ?? values.logoUrl;
    const hasLogo = Boolean(logoImageUrl);

    useEffect(() => {
        return () => {
            if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
        };
    }, [logoPreviewUrl]);

    // Tạo preview local và upload logo ngay để form lưu URL thật thay vì chỉ giữ file trong browser.
    const handleLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!isSupportedShopLogoMimeType(file.type)) {
            toast.error('Logo shop chỉ hỗ trợ JPG, PNG hoặc WebP.');
            if (logoInputRef.current) logoInputRef.current.value = '';
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        const requestId = logoUploadRequestRef.current + 1;
        logoUploadRequestRef.current = requestId;

        if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
        setLogoPreviewUrl(previewUrl);
        setLogoFileName(file.name);
        setLogoUploadProgress(0);
        setLogoUploading(true);
        onChange({ logoUrl: '' });

        try {
            const presigned = await mediaService.createPresignedUpload({
                fileName: file.name,
                contentType: file.type as MediaUploadMimeType,
                fileSize: file.size,
                purpose: 'shop_avatar',
            });

            await mediaService.uploadToPresignedPost(
                presigned.upload,
                file,
                setLogoUploadProgress,
            );

            // Bỏ qua response cũ nếu người dùng đổi sang file khác trong lúc request trước chưa hoàn tất.
            if (logoUploadRequestRef.current !== requestId) return;

            onChange({ logoUrl: buildProcessedLogoUrl(presigned) });
            toast.success('Đã tải logo shop.');
        } catch (err) {
            if (logoUploadRequestRef.current === requestId) {
                URL.revokeObjectURL(previewUrl);
                setLogoPreviewUrl(null);
                setLogoFileName('');
                setLogoUploadProgress(0);
                onChange({ logoUrl: '' });
                toast.error(getErrorMessage(err));
            }
        } finally {
            if (logoUploadRequestRef.current === requestId) {
                setLogoUploading(false);
            }
        }
    };

    // Cho phép bỏ ảnh đã chọn và reset input file để người dùng chọn lại cùng một file nếu cần.
    const clearLogo = () => {
        logoUploadRequestRef.current += 1;
        if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
        setLogoPreviewUrl(null);
        setLogoFileName('');
        setLogoUploadProgress(0);
        setLogoUploading(false);
        onChange({ logoUrl: '' });
        if (logoInputRef.current) logoInputRef.current.value = '';
    };

    return (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_220px]">
            <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <Field
                    label="Tên shop"
                    htmlFor="shopName"
                    error={errors['shop.name']}
                    required
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
                    required
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
                    required
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
                    required
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
                    {logoImageUrl ? (
                        <img
                            src={logoImageUrl}
                            alt="Logo shop đã chọn"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <ImagePlus className="size-8 text-zinc-400" />
                    )}
                    {logoUploading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 text-xs font-medium text-zinc-700">
                            <Loader2 className="size-5 animate-spin" />
                            {logoUploadProgress}%
                        </div>
                    ) : null}
                    {hasLogo && !logoUploading ? (
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
                    Logo shop <span className="text-red-500">*</span>
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
                {errors['shop.logoUrl'] ? (
                    <p className="mt-2 text-xs leading-5 text-red-600">
                        {errors['shop.logoUrl']}
                    </p>
                ) : null}
                <input
                    ref={logoInputRef}
                    id="shopLogo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    disabled={logoUploading}
                    onChange={handleLogoChange}
                />
                <label
                    htmlFor="shopLogo"
                    className={[
                        'mt-3 inline-flex h-9 w-full items-center justify-center rounded-full border border-input bg-background px-3 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground',
                        logoUploading
                            ? 'pointer-events-none cursor-not-allowed opacity-60'
                            : 'cursor-pointer',
                    ].join(' ')}
                >
                    {logoUploading
                        ? 'Đang tải...'
                        : hasLogo
                          ? 'Đổi ảnh'
                          : 'Chọn ảnh'}
                </label>
            </div>
        </div>
    );
}

// Kiểm tra MIME type trước khi xin presigned URL để tránh upload file không phải ảnh hợp lệ.
function isSupportedShopLogoMimeType(
    contentType: string,
): contentType is MediaUploadMimeType {
    return SHOP_LOGO_MIME_TYPES.has(contentType as MediaUploadMimeType);
}

// Suy ra URL processed medium từ object key gốc vì Lambda luôn xuất ảnh theo cùng purpose/ownerId/assetId.
function buildProcessedLogoUrl(presigned: PresignedUploadResponse): string {
    if (!presigned.publicBaseUrl) {
        throw new Error('Media CDN chưa được cấu hình.');
    }

    const parts = presigned.objectKey.split('/');
    const [, , purpose, ownerId, assetId] = parts;

    if (!purpose || !ownerId || !assetId) {
        throw new Error('Đường dẫn upload logo không hợp lệ.');
    }

    return [
        presigned.publicBaseUrl.replace(/\/$/, ''),
        'media',
        'processed',
        purpose,
        ownerId,
        assetId,
        'medium.webp',
    ].join('/');
}
