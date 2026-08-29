'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import type { UseFormSetValue } from 'react-hook-form';
import { toast } from 'sonner';

import { mediaService, type MediaUploadMimeType } from '@/services/media';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type {
    ProductCreateImageValue,
    SellerProductCreateFormValues,
} from '../types/seller-product-create-form.type';
import { buildProcessedProductImageUrl } from '../utils/product-image-url.util';

export const PRODUCT_MIN_IMAGE_COUNT = 2;
export const PRODUCT_MAX_IMAGE_COUNT = 9;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const PRODUCT_IMAGE_MIME_TYPES = new Set<MediaUploadMimeType>([
    'image/jpeg',
    'image/png',
    'image/webp',
]);

interface UseProductImageUploadOptions {
    images: ProductCreateImageValue[];
    setValue: UseFormSetValue<SellerProductCreateFormValues>;
}

// Quản lý preview cục bộ và upload tuần tự để người bán thấy ảnh ngay trong khi ảnh thật được đưa thẳng lên S3.
export function useProductImageUpload({
    images,
    setValue,
}: UseProductImageUploadOptions) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    // Mở input ẩn để bề mặt thao tác vẫn dùng button nhất quán với giao diện Seller Center.
    const openFilePicker = () => {
        inputRef.current?.click();
    };

    // Xác thực file ở FE trước, sau đó upload lần lượt để hiển thị tiến độ tổng và giữ được phần ảnh đã tải thành công.
    const selectFiles = async (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files ?? []);
        resetInput();
        if (selectedFiles.length === 0) return;

        const availableSlots = PRODUCT_MAX_IMAGE_COUNT - images.length;
        if (selectedFiles.length > availableSlots) {
            toast.error(`Bạn chỉ có thể tải thêm ${availableSlots} ảnh.`);
            return;
        }

        const invalidFile = selectedFiles.find(
            (file) =>
                !isSupportedMimeType(file.type) ||
                file.size > MAX_IMAGE_SIZE_BYTES,
        );
        if (invalidFile) {
            toast.error('Ảnh phải là JPG, PNG hoặc WebP và không vượt quá 5 MB.');
            return;
        }

        setUploading(true);
        setProgress(0);
        const uploadedImages: ProductCreateImageValue[] = [];

        try {
            for (let index = 0; index < selectedFiles.length; index += 1) {
                const file = selectedFiles[index];
                const previewUrl = URL.createObjectURL(file);
                let uploadedAssetId: string | undefined;
                try {
                    const presigned = await mediaService.createPresignedUpload({
                        fileName: file.name,
                        contentType: file.type as MediaUploadMimeType,
                        fileSize: file.size,
                        purpose: 'product_image',
                    });
                    uploadedAssetId = presigned.assetId;

                    await mediaService.uploadToPresignedPost(
                        presigned.upload,
                        file,
                        (fileProgress) => {
                            const completed = index * 100 + fileProgress;
                            setProgress(
                                Math.round(completed / selectedFiles.length),
                            );
                        },
                    );

                    uploadedImages.push({
                        assetId: presigned.assetId,
                        publicUrl: buildProcessedProductImageUrl(presigned),
                        previewUrl,
                        fileName: file.name,
                    });
                } catch (error) {
                    URL.revokeObjectURL(previewUrl);
                    if (uploadedAssetId) void cleanupTemporaryImage(uploadedAssetId);
                    throw error;
                }
            }

            setValue('images', [...images, ...uploadedImages], {
                shouldDirty: true,
                shouldValidate: true,
            });
            toast.success(`${uploadedImages.length} ảnh đã được tải lên thành công.`);
        } catch (error) {
            // Chỉ giữ ảnh đã hoàn tất upload; ảnh lỗi sẽ không tạo dữ liệu form sai hoặc preview mồ côi.
            if (uploadedImages.length > 0) {
                setValue('images', [...images, ...uploadedImages], {
                    shouldDirty: true,
                    shouldValidate: true,
                });
            }
            toast.error(getErrorMessage(error));
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    // Xóa khỏi form ngay lập tức, sau đó dọn asset mới trên S3; asset cũ của sản phẩm để Product Service xử lý sau khi update commit.
    const removeImage = async (assetId: string) => {
        const removed = images.find((image) => image.assetId === assetId);
        setValue(
            'images',
            images.filter((image) => image.assetId !== assetId),
            { shouldDirty: true, shouldValidate: true },
        );

        if (removed && isTemporaryPreviewUrl(removed.previewUrl)) {
            URL.revokeObjectURL(removed.previewUrl);
            try {
                await mediaService.cleanupProductAssets([
                    { assetId: removed.assetId, purpose: 'product_image' },
                ]);
            } catch {
                toast.warning('Đã xóa ảnh khỏi biểu mẫu nhưng chưa thể dọn file lưu trữ.');
            }
        }
    };

    // Đặt ảnh đã chọn lên đầu mảng vì mapper coi phần tử đầu tiên là ảnh bìa của sản phẩm.
    const setThumbnail = (assetId: string) => {
        const selected = images.find((image) => image.assetId === assetId);
        if (!selected) return;
        setValue(
            'images',
            [selected, ...images.filter((image) => image.assetId !== assetId)],
            { shouldDirty: true, shouldValidate: true },
        );
    };

    // Cho phép chọn lại đúng file vừa chọn vì browser không phát sự kiện change khi giá trị input không đổi.
    const resetInput = () => {
        if (inputRef.current) inputRef.current.value = '';
    };

    return {
        inputRef,
        uploading,
        progress,
        openFilePicker,
        selectFiles,
        removeImage,
        setThumbnail,
    };
}

// Thu hẹp MIME type sau bước kiểm tra để request tới Media Service luôn đúng union type đã khai báo.
function isSupportedMimeType(
    contentType: string,
): contentType is MediaUploadMimeType {
    return PRODUCT_IMAGE_MIME_TYPES.has(contentType as MediaUploadMimeType);
}

// Nhận diện preview blob do phiên chỉnh sửa hiện tại tạo; URL CDN của sản phẩm cũ không được xóa trực tiếp từ FE.
function isTemporaryPreviewUrl(previewUrl: string): boolean {
    return previewUrl.startsWith('blob:');
}

// Dọn asset đã presign nhưng không thể hoàn tất bước chuẩn hóa URL hoặc ghi vào form.
async function cleanupTemporaryImage(assetId: string): Promise<void> {
    try {
        await mediaService.cleanupProductAssets([
            { assetId, purpose: 'product_image' },
        ]);
    } catch {
        toast.warning('Không thể dọn ảnh tải lỗi khỏi bộ nhớ lưu trữ.');
    }
}
