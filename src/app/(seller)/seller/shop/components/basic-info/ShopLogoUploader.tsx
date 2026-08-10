'use client';

import { ImageUp, Loader2, Upload } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useShopLogoUpload } from '../../hooks/useShopLogoUpload';
import { ShopLogoPreview } from './ShopLogoPreview';

interface ShopLogoUploaderProps {
    currentUrl: string;
    disabled: boolean;
    onUploaded: (url: string) => void;
    onUploadingChange: (uploading: boolean) => void;
}

// Kết nối vùng chọn logo với hook upload S3 và giữ preview tức thời trong suốt lúc Lambda xử lý ảnh.
export function ShopLogoUploader({
    currentUrl,
    disabled,
    onUploaded,
    onUploadingChange,
}: ShopLogoUploaderProps) {
    const {
        inputRef,
        previewUrl,
        progress,
        uploading,
        selectFile,
        openFilePicker,
    } = useShopLogoUpload({ onUploaded });

    useEffect(() => {
        // Đồng bộ trạng thái upload lên form cha để nút lưu không thể gửi URL cũ khi file mới còn đang tải.
        onUploadingChange(uploading);
    }, [onUploadingChange, uploading]);

    return (
        <div className="border-b border-zinc-200 bg-zinc-50/70 p-5 sm:p-7 lg:border-b-0 lg:border-r">
            <p className="text-xs font-semibold uppercase text-zinc-500">
                Logo shop
            </p>
            <ShopLogoPreview
                src={previewUrl ?? currentUrl}
                alt="Logo shop đang chỉnh sửa"
                className="mt-4 aspect-square w-full max-w-52 rounded-md border border-zinc-200 bg-white shadow-sm"
            />
            <p className="mt-4 text-sm font-medium text-zinc-950">
                Ảnh vuông, rõ nét
            </p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
                JPG, PNG hoặc WebP, tối đa 5 MB. Ảnh sẽ được tối ưu thành nhiều
                kích thước sau khi tải lên.
            </p>

            <Input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={disabled || uploading}
                onChange={selectFile}
            />
            <Button
                type="button"
                variant="outline"
                className="mt-4 w-full max-w-52"
                disabled={disabled || uploading}
                onClick={openFilePicker}
            >
                {uploading ? (
                    <Loader2 className="size-4 animate-spin" />
                ) : (
                    <ImageUp className="size-4" />
                )}
                {uploading ? 'Đang tải logo...' : 'Chọn logo mới'}
            </Button>

            {uploading ? (
                <div className="mt-4 max-w-52">
                    <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                        <span className="inline-flex items-center gap-1.5">
                            <Upload className="size-3.5" />
                            Đang tải trực tiếp lên kho ảnh
                        </span>
                        <span className="tabular-nums">{progress}%</span>
                    </div>
                    <Progress value={progress} />
                </div>
            ) : null}
        </div>
    );
}
