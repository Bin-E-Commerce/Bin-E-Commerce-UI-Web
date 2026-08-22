import {
    AVATAR_ALLOWED_MIME_TYPES,
    AVATAR_MAX_SIZE_BYTES,
} from '../constants/avatar-upload.constant';
import type { AvatarVariantUrls } from '../types/avatar-upload.type';

const PROCESSED_VARIANT_PATTERN = /\/(thumb|medium|large)\.webp(?:\?.*)?$/;

// Kiểm tra file ngay trên frontend để chặn sớm ảnh sai định dạng hoặc quá dung lượng trước khi xin presigned URL.
export function validateAvatarFile(file: File): string | null {
    if (!AVATAR_ALLOWED_MIME_TYPES.includes(file.type as never)) {
        return 'Vui lòng chọn ảnh JPG, PNG hoặc WEBP.';
    }

    if (file.size > AVATAR_MAX_SIZE_BYTES) {
        return 'Ảnh đại diện không được vượt quá 5MB.';
    }

    return null;
}

// Suy ra 3 URL ảnh đã resize từ objectKey gốc mà media-service cấp cho lần upload.
export function buildProcessedAvatarUrls(
    publicBaseUrl: string | null,
    objectKey: string,
): AvatarVariantUrls {
    if (!publicBaseUrl) {
        throw new Error('Media service chưa cấu hình MEDIA_PUBLIC_CDN_URL.');
    }

    const parts = objectKey.split('/');
    const [, , purpose, ownerId, assetId] = parts;

    if (!purpose || !ownerId || !assetId) {
        throw new Error('Đường dẫn ảnh upload không hợp lệ.');
    }

    const baseUrl = publicBaseUrl.replace(/\/$/, '');
    const processedBase = `${baseUrl}/media/processed/${purpose}/${ownerId}/${assetId}`;

    return {
        thumb: `${processedBase}/thumb.webp`,
        medium: `${processedBase}/medium.webp`,
        large: `${processedBase}/large.webp`,
    };
}

// Từ một URL avatar đã lưu trong DB, suy ra srcSet để browser tự chọn ảnh nhỏ/lớn theo kích thước hiển thị.
export function getAvatarVariantUrls(
    avatarUrl: string | null | undefined,
): AvatarVariantUrls | null {
    if (!avatarUrl) return null;

    if (!PROCESSED_VARIANT_PATTERN.test(avatarUrl)) {
        return {
            thumb: avatarUrl,
            medium: avatarUrl,
            large: avatarUrl,
        };
    }

    return {
        thumb: avatarUrl.replace(PROCESSED_VARIANT_PATTERN, '/thumb.webp'),
        medium: avatarUrl.replace(PROCESSED_VARIANT_PATTERN, '/medium.webp'),
        large: avatarUrl.replace(PROCESSED_VARIANT_PATTERN, '/large.webp'),
    };
}

// Chờ CloudFront/S3 có ảnh resized trước khi lưu vào profile để hạn chế avatar bị 404 ngay sau upload.
export async function waitForImageReady(
    imageUrl: string,
    options: { attempts?: number; delayMs?: number } = {},
): Promise<boolean> {
    const attempts = options.attempts ?? 15;
    const delayMs = options.delayMs ?? 800;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        const isReady = await probeImage(`${imageUrl}?v=${Date.now()}`);
        if (isReady) return true;

        await sleep(delayMs);
    }

    return false;
}

// Tải thử ảnh bằng Image object vì cách này nhẹ hơn gọi API riêng và tận dụng đúng cache/CDN path của frontend.
function probeImage(imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(true);
        image.onerror = () => resolve(false);
        image.src = imageUrl;
    });
}

// Tạo khoảng nghỉ giữa các lần kiểm tra để Lambda có thời gian resize và upload ảnh biến thể.
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}
