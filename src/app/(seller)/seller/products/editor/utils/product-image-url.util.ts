import type { PresignedUploadResponse } from '@/services/media';

// Suy ra URL WebP cỡ lớn theo contract object key dùng chung giữa Media Service và Lambda.
export function buildProcessedProductImageUrl(
    presigned: PresignedUploadResponse,
): string {
    if (!presigned.publicBaseUrl) {
        throw new Error('Media CDN chưa được cấu hình.');
    }

    const [, , purpose, ownerId, assetId] = presigned.objectKey.split('/');
    if (purpose !== 'product_image' || !ownerId || !assetId) {
        throw new Error('Đường dẫn upload ảnh sản phẩm không hợp lệ.');
    }

    return [
        presigned.publicBaseUrl.replace(/\/$/, ''),
        'media',
        'processed',
        purpose,
        ownerId,
        assetId,
        'large.webp',
    ].join('/');
}

// Video hiện chưa qua Lambda xử lý nên preview và payload dùng URL object gốc từ CDN/S3.
export function buildOriginalProductMediaUrl(
    presigned: PresignedUploadResponse,
): string {
    if (!presigned.publicBaseUrl) {
        throw new Error('Media CDN chưa được cấu hình.');
    }

    return `${presigned.publicBaseUrl.replace(/\/$/, '')}/${presigned.objectKey}`;
}
