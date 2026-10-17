// File này upload ảnh/video đánh giá lên Media Service và trả URL công khai cho review.
// Ảnh dùng object gốc để hiển thị ngay, không phụ thuộc Lambda tạo WebP bất đồng bộ.
import {
    mediaService,
    type MediaUploadMimeType,
    type ReviewMediaCleanupAsset,
} from '@/services/media';

type ReviewMediaUploadResult = {
    imageUrls: string[];
    videoUrls: string[];
    uploadedAssets: ReviewMediaCleanupAsset[];
};

// Dùng URL object gốc cho cả ảnh và video để review không trỏ tới file xử lý chưa tồn tại.
function buildOriginalReviewMediaUrl(
    publicBaseUrl: string | null,
    objectKey: string,
    purpose: 'review_image' | 'review_video',
): string {
    if (!publicBaseUrl) throw new Error('Media CDN chưa được cấu hình.');
    const [, , keyPurpose, ownerId, assetId] = objectKey.split('/');
    if (keyPurpose !== purpose || !ownerId || !assetId)
        throw new Error('Đường dẫn media đánh giá không hợp lệ.');
    return `${publicBaseUrl.replace(/\/$/, '')}/${objectKey}`;
}

// Upload song song anh va video; nếu một file thất bại thì dọn tất cả asset đã upload thành công trong batch đó.
export async function uploadReviewMedia(
    images: File[],
    videos: File[],
): Promise<ReviewMediaUploadResult> {
    const uploadedAssets: ReviewMediaCleanupAsset[] = [];
    const uploadTasks = [
        ...images.map((file) => ({ file, purpose: 'review_image' as const })),
        ...videos.map((file) => ({ file, purpose: 'review_video' as const })),
    ];

    const results = await Promise.allSettled(
        uploadTasks.map(async ({ file, purpose }) => {
            const presigned = await mediaService.createPresignedUpload({
                fileName: file.name,
                contentType: file.type as MediaUploadMimeType,
                fileSize: file.size,
                purpose,
            });
            await mediaService.uploadToPresignedPost(presigned.upload, file);
            const uploadedAsset = {
                assetId: presigned.assetId,
                purpose,
            } satisfies ReviewMediaCleanupAsset;
            uploadedAssets.push(uploadedAsset);
            return {
                purpose,
                url: buildOriginalReviewMediaUrl(
                    presigned.publicBaseUrl,
                    presigned.objectKey,
                    purpose,
                ),
            };
        }),
    );

    const failedUpload = results.find(
        (result): result is PromiseRejectedResult =>
            result.status === 'rejected',
    );
    if (failedUpload) {
        await mediaService
            .cleanupUploadedReviewAssets(uploadedAssets)
            .catch(() => undefined);
        throw failedUpload.reason instanceof Error
            ? failedUpload.reason
            : new Error('Không thể upload media đánh giá.');
    }

    const successfulResults = results.map(
        (result) =>
            (
                result as PromiseFulfilledResult<{
                    purpose: 'review_image' | 'review_video';
                    url: string;
                }>
            ).value,
    );
    return {
        imageUrls: successfulResults
            .filter((result) => result.purpose === 'review_image')
            .map((result) => result.url),
        videoUrls: successfulResults
            .filter((result) => result.purpose === 'review_video')
            .map((result) => result.url),
        uploadedAssets,
    };
}
