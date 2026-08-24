'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import type { UseFormSetValue } from 'react-hook-form';
import { toast } from 'sonner';

import { mediaService, type MediaUploadMimeType } from '@/services/media';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type {
    ProductCreateVideoValue,
    SellerProductCreateFormValues,
} from '../types/seller-product-create-form.type';
import { buildOriginalProductMediaUrl } from '../utils/product-image-url.util';

export const PRODUCT_VIDEO_MIN_DURATION_SECONDS = 10;
export const PRODUCT_VIDEO_MAX_DURATION_SECONDS = 60;
export const PRODUCT_VIDEO_MAX_SIZE_BYTES = 30 * 1024 * 1024;

const PRODUCT_VIDEO_MIME_TYPES = new Set<MediaUploadMimeType>([
    'video/mp4',
    'video/webm',
]);

interface UseProductVideoUploadOptions {
    video: ProductCreateVideoValue | null;
    setValue: UseFormSetValue<SellerProductCreateFormValues>;
}

// Quản lý một video giới thiệu ngắn và upload trực tiếp lên S3 để API ứng dụng không phải nhận file lớn.
export function useProductVideoUpload({
    video,
    setValue,
}: UseProductVideoUploadOptions) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    // Mở input ẩn để giao diện chỉ hiển thị một nút tải video thống nhất với design system.
    const openFilePicker = () => {
        inputRef.current?.click();
    };

    // Kiểm tra định dạng, dung lượng và thời lượng trước khi phát sinh presigned URL hoặc gửi dữ liệu lên S3.
    const selectVideo = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        resetInput();
        if (!file) return;

        if (!isSupportedVideoMimeType(file.type)) {
            toast.error('Video chỉ hỗ trợ định dạng MP4 hoặc WebM.');
            return;
        }
        if (file.size > PRODUCT_VIDEO_MAX_SIZE_BYTES) {
            toast.error('Video không được vượt quá 30 MB.');
            return;
        }

        let previewUrl: string | undefined;
        let uploadedAssetId: string | undefined;
        try {
            previewUrl = URL.createObjectURL(file);
            const durationSeconds = await getVideoDuration(previewUrl);
            if (
                durationSeconds < PRODUCT_VIDEO_MIN_DURATION_SECONDS ||
                durationSeconds > PRODUCT_VIDEO_MAX_DURATION_SECONDS
            ) {
                throw new Error('Video cần có thời lượng từ 10 đến 60 giây.');
            }

            setUploading(true);
            setProgress(0);
            const presigned = await mediaService.createPresignedUpload({
                fileName: file.name,
                contentType: file.type as MediaUploadMimeType,
                fileSize: file.size,
                purpose: 'product_video',
            });
            uploadedAssetId = presigned.assetId;
            await mediaService.uploadToPresignedPost(
                presigned.upload,
                file,
                setProgress,
            );

            const previousVideo = video;
            setValue(
                'video',
                {
                    assetId: presigned.assetId,
                    publicUrl: buildOriginalProductMediaUrl(presigned),
                    previewUrl,
                    fileName: file.name,
                    durationSeconds: Math.round(durationSeconds),
                },
                { shouldDirty: true, shouldValidate: true },
            );
            previewUrl = undefined;
            if (previousVideo && isTemporaryPreviewUrl(previousVideo.previewUrl)) {
                URL.revokeObjectURL(previousVideo.previewUrl);
                void cleanupTemporaryVideo(previousVideo.assetId);
            }
            toast.success('Video sản phẩm đã được tải lên.');
        } catch (error) {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            if (uploadedAssetId) void cleanupTemporaryVideo(uploadedAssetId);
            toast.error(getErrorMessage(error));
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    // Xóa video khỏi form ngay lập tức; chỉ asset mới của phiên này được dọn trực tiếp để không ảnh hưởng bản đang bán.
    const removeVideo = async () => {
        setValue('video', null, { shouldDirty: true, shouldValidate: true });
        if (video && isTemporaryPreviewUrl(video.previewUrl)) {
            URL.revokeObjectURL(video.previewUrl);
            try {
                await mediaService.cleanupProductAssets([
                    { assetId: video.assetId, purpose: 'product_video' },
                ]);
            } catch {
                toast.warning('Đã xóa video khỏi biểu mẫu nhưng chưa thể dọn file lưu trữ.');
            }
        }
    };

    // Reset input để người dùng vẫn có thể chọn lại chính file vừa chọn sau khi xóa hoặc sửa.
    const resetInput = () => {
        if (inputRef.current) inputRef.current.value = '';
    };

    return {
        inputRef,
        uploading,
        progress,
        openFilePicker,
        selectVideo,
        removeVideo,
    };
}

// Đọc metadata ở trình duyệt thay vì tin vào tên file hoặc giá trị do người dùng nhập.
function getVideoDuration(previewUrl: string): Promise<number> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            const duration = video.duration;
            video.remove();
            Number.isFinite(duration)
                ? resolve(duration)
                : reject(new Error('Không thể đọc thời lượng video.'));
        };
        video.onerror = () => {
            video.remove();
            reject(new Error('Video không thể đọc được.'));
        };
        video.src = previewUrl;
    });
}

// Thu hẹp MIME type sau validation để request Media Service luôn đúng union type.
function isSupportedVideoMimeType(
    contentType: string,
): contentType is MediaUploadMimeType {
    return PRODUCT_VIDEO_MIME_TYPES.has(contentType as MediaUploadMimeType);
}

// Nhận diện preview blob do phiên chỉnh sửa hiện tại tạo; URL CDN của video cũ chỉ được dọn sau update thành công.
function isTemporaryPreviewUrl(previewUrl: string): boolean {
    return previewUrl.startsWith('blob:');
}

// Dọn asset video mới bị thay thế nhưng không làm hỏng thao tác thay video nếu API cleanup tạm thời lỗi.
async function cleanupTemporaryVideo(assetId: string): Promise<void> {
    try {
        await mediaService.cleanupProductAssets([
            { assetId, purpose: 'product_video' },
        ]);
    } catch {
        toast.warning('Video cũ đã được thay khỏi biểu mẫu nhưng chưa thể dọn file lưu trữ.');
    }
}
