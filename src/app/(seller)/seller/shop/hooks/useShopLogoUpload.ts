'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { toast } from 'sonner';

import { mediaService, type MediaUploadMimeType } from '@/services/media';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { buildProcessedShopLogoUrl } from '../utils/shop-profile-formatters';

const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024;
const SHOP_LOGO_MIME_TYPES = new Set<MediaUploadMimeType>([
    'image/jpeg',
    'image/png',
    'image/webp',
]);

interface UseShopLogoUploadOptions {
    onUploaded: (url: string) => void;
}

// Upload logo trực tiếp lên S3 bằng presigned POST, đồng thời giữ preview local để người dùng không phải chờ CDN.
export function useShopLogoUpload({ onUploaded }: UseShopLogoUploadOptions) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const requestIdRef = useRef(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // Kiểm tra định dạng và kích thước ở trình duyệt trước khi xin presigned URL để tránh request không cần thiết.
    const selectFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!isSupportedMimeType(file.type)) {
            toast.error('Logo chỉ hỗ trợ JPG, PNG hoặc WebP.');
            resetInput();
            return;
        }

        if (file.size > MAX_LOGO_SIZE_BYTES) {
            toast.error('Logo không được vượt quá 5 MB.');
            resetInput();
            return;
        }

        const localPreview = URL.createObjectURL(file);
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(localPreview);
        setProgress(0);
        setUploading(true);

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
                setProgress,
            );

            // Bỏ response cũ nếu người dùng đã chọn file khác trong lúc upload để tránh ghi đè logo mới hơn.
            if (requestIdRef.current !== requestId) return;
            onUploaded(buildProcessedShopLogoUrl(presigned));
            toast.success('Logo mới đã sẵn sàng để lưu.');
        } catch (error) {
            if (requestIdRef.current === requestId) {
                setPreviewUrl(null);
                setProgress(0);
                toast.error(getErrorMessage(error));
            }
        } finally {
            if (requestIdRef.current === requestId) {
                setUploading(false);
                resetInput();
            }
        }
    };

    // Mở hộp chọn file qua nút shadcn thay vì hiển thị input file mặc định.
    const openFilePicker = () => {
        inputRef.current?.click();
    };

    // Reset giá trị input để người dùng có thể chọn lại đúng file vừa chọn nếu cần.
    const resetInput = () => {
        if (inputRef.current) inputRef.current.value = '';
    };

    return {
        inputRef,
        previewUrl,
        progress,
        uploading,
        selectFile,
        openFilePicker,
    };
}

// Thu hẹp kiểu MIME sau khi kiểm tra Set để payload gửi media-service không cần ép kiểu ở nơi khác.
function isSupportedMimeType(
    contentType: string,
): contentType is MediaUploadMimeType {
    return SHOP_LOGO_MIME_TYPES.has(contentType as MediaUploadMimeType);
}
