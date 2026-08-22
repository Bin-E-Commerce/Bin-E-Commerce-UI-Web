'use client';

import { AlertCircle, Loader2, LockKeyhole, Save, X } from 'lucide-react';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ShopProfileDto } from '@/services/seller';
import type { ShopProfileFormValues } from '../../schemas/shop-profile.schema';
import { formatBusinessModel } from '../../utils/shop-profile-formatters';
import { ShopLogoUploader } from './ShopLogoUploader';

interface ShopProfileEditFormProps {
    profile: ShopProfileDto;
    categoryName: string;
    form: UseFormReturn<ShopProfileFormValues>;
    saving: boolean;
    onCancel: () => void;
    onSubmit: () => void;
}

// Hiển thị lỗi Zod ngay dưới field để người bán biết chính xác dữ liệu nào cần sửa.
function FieldError({ message }: { message?: string }) {
    if (!message) return null;

    return (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="size-3.5" />
            {message}
        </p>
    );
}

// Cho phép chỉnh các trường công khai đã được backend whitelist và khóa toàn bộ dữ liệu cần quy trình duyệt riêng.
export function ShopProfileEditForm({
    profile,
    categoryName,
    form,
    saving,
    onCancel,
    onSubmit,
}: ShopProfileEditFormProps) {
    const {
        register,
        setValue,
        watch,
        formState: { errors, isDirty, isValid },
    } = form;
    const logoUrl = watch('logoUrl');
    const [logoUploading, setLogoUploading] = useState(false);

    // Ghi URL ảnh đã upload vào React Hook Form để dirty state và Zod cùng được cập nhật ngay.
    const handleLogoUploaded = (url: string) => {
        setValue('logoUrl', url, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    };

    return (
        <form onSubmit={onSubmit}>
            <div className="grid lg:grid-cols-[300px_minmax(0,1fr)]">
                <ShopLogoUploader
                    currentUrl={logoUrl}
                    disabled={saving}
                    onUploaded={handleLogoUploaded}
                    onUploadingChange={setLogoUploading}
                />

                <div className="min-w-0 p-5 sm:p-7">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="shop-profile-name">
                                Tên shop <span className="text-red-600">*</span>
                            </Label>
                            <Input
                                id="shop-profile-name"
                                className="mt-2 h-11"
                                aria-invalid={Boolean(errors.name)}
                                disabled={saving}
                                {...register('name')}
                            />
                            <FieldError message={errors.name?.message} />
                        </div>

                        <div>
                            <Label htmlFor="shop-profile-slug">
                                Đường dẫn shop
                            </Label>
                            <Input
                                id="shop-profile-slug"
                                className="mt-2 h-11 bg-zinc-50"
                                value={profile.shop.slug}
                                disabled
                                readOnly
                            />
                            <p className="mt-1.5 text-xs text-zinc-500">
                                Được giữ cố định để liên kết sản phẩm không bị
                                thay đổi.
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="shop-profile-email">
                                Email hỗ trợ{' '}
                                <span className="text-red-600">*</span>
                            </Label>
                            <Input
                                id="shop-profile-email"
                                type="email"
                                className="mt-2 h-11"
                                aria-invalid={Boolean(errors.contactEmail)}
                                disabled={saving}
                                {...register('contactEmail')}
                            />
                            <FieldError
                                message={errors.contactEmail?.message}
                            />
                        </div>

                        <div>
                            <Label htmlFor="shop-profile-phone">
                                Số điện thoại hỗ trợ{' '}
                                <span className="text-red-600">*</span>
                            </Label>
                            <Input
                                id="shop-profile-phone"
                                inputMode="numeric"
                                className="mt-2 h-11"
                                aria-invalid={Boolean(errors.contactPhone)}
                                disabled={saving}
                                {...register('contactPhone')}
                            />
                            <FieldError
                                message={errors.contactPhone?.message}
                            />
                        </div>
                    </div>

                    <div className="mt-5">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="shop-profile-description">
                                Mô tả shop
                            </Label>
                            <span className="text-xs tabular-nums text-zinc-400">
                                {watch('description').length}/1000
                            </span>
                        </div>
                        <Textarea
                            id="shop-profile-description"
                            rows={5}
                            className="mt-2 min-h-32 resize-y"
                            aria-invalid={Boolean(errors.description)}
                            disabled={saving}
                            placeholder="Giới thiệu sản phẩm chủ lực và cam kết phục vụ của shop."
                            {...register('description')}
                        />
                        <FieldError message={errors.description?.message} />
                    </div>

                    <div className="mt-6 rounded-md border border-zinc-200 bg-zinc-50 p-4">
                        <div className="flex items-start gap-3">
                            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-zinc-500" />
                            <div>
                                <p className="text-sm font-semibold text-zinc-950">
                                    Thông tin đã duyệt
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-500">
                                    Ngành hàng chính: {categoryName} · Mô hình:{' '}
                                    {formatBusinessModel(
                                        profile.shop.businessModel,
                                    )}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-500">
                                    Các thay đổi liên quan đến ngành hàng, thuế
                                    hoặc định danh cần được kiểm tra lại.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="flex flex-col-reverse gap-2 border-t border-zinc-200 bg-zinc-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="sm:min-w-28"
                    disabled={saving}
                    onClick={onCancel}
                >
                    <X className="size-4" />
                    Hủy
                </Button>
                <Button
                    type="submit"
                    size="lg"
                    className="bg-zinc-950 px-5 text-white hover:bg-zinc-800 sm:min-w-36"
                    disabled={saving || logoUploading || !isDirty || !isValid}
                >
                    {saving ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Save className="size-4" />
                    )}
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
            </footer>
        </form>
    );
}
