// File này upload evidence hoàn hàng lên Media Service bằng presigned POST.
// Component chỉ nhận URL sau upload; cleanup asset thất bại được gọi ngay để tránh orphan S3.

import {
    mediaService,
    type MediaUploadMimeType,
    type ReviewMediaCleanupAsset,
} from '@/services/media';

export interface ReturnMediaUploadResult {
    evidence: Array<{ assetId: string; url: string; type: 'image' | 'video' }>;
    uploadedAssets: ReviewMediaCleanupAsset[];
}

function publicUrl(
    publicBaseUrl: string | null,
    objectKey: string,
    purpose: 'return_image' | 'return_video',
): string {
    if (!publicBaseUrl) throw new Error('Media CDN chưa được cấu hình.');
    const [, , keyPurpose, ownerId, assetId] = objectKey.split('/');
    if (keyPurpose !== purpose || !ownerId || !assetId)
        throw new Error('Media hoàn hàng không hợp lệ.');
    // Return evidence dùng object gốc để customer xem được ngay sau khi submit,
    // không phụ thuộc Lambda resize bất đồng bộ có tạo large.webp hay chưa.
    return `${publicBaseUrl.replace(/\/$/, '')}/${objectKey}`;
}

// Upload song song tối đa 5 ảnh và 1 video, rollback toàn bộ asset đã upload khi một file lỗi.
export async function uploadReturnMedia(
    images: File[],
    videos: File[],
): Promise<ReturnMediaUploadResult> {
    const uploadedAssets: ReviewMediaCleanupAsset[] = [];
    const tasks = [
        ...images.map((file) => ({
            file,
            purpose: 'return_image' as const,
            type: 'image' as const,
        })),
        ...videos.map((file) => ({
            file,
            purpose: 'return_video' as const,
            type: 'video' as const,
        })),
    ];
    try {
        const results = await Promise.all(
            tasks.map(async ({ file, purpose, type }) => {
                const presigned = await mediaService.createPresignedUpload({
                    fileName: file.name,
                    contentType: file.type as MediaUploadMimeType,
                    fileSize: file.size,
                    purpose,
                });
                await mediaService.uploadToPresignedPost(
                    presigned.upload,
                    file,
                );
                uploadedAssets.push({ assetId: presigned.assetId, purpose });
                return {
                    assetId: presigned.assetId,
                    url: publicUrl(
                        presigned.publicBaseUrl,
                        presigned.objectKey,
                        purpose,
                    ),
                    type,
                };
            }),
        );
        return { evidence: results, uploadedAssets };
    } catch (error) {
        if (uploadedAssets.length > 0)
            await mediaService
                .cleanupUploadedReviewAssets(uploadedAssets)
                .catch(() => undefined);
        throw error;
    }
}
