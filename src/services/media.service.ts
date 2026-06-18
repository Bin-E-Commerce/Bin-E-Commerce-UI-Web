import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';

export type MediaUploadPurpose =
    | 'avatar'
    | 'product_image'
    | 'shop_avatar'
    | 'shop_cover'
    | 'review_image'
    | 'chat_image';

export type MediaUploadMimeType = 'image/jpeg' | 'image/png' | 'image/webp';

export interface CreatePresignedUploadPayload {
    fileName: string;
    contentType: MediaUploadMimeType;
    fileSize: number;
    purpose: MediaUploadPurpose;
}

export interface PresignedUploadResponse {
    assetId: string;
    objectKey: string;
    expiresIn: number;
    status: 'uploading';
    upload: {
        url: string;
        fields: Record<string, string>;
    };
    publicBaseUrl: string | null;
}

export interface DeleteMediaAssetResponse {
    assetId: string;
    deletedCount: number;
}

export interface ConfirmAvatarResponse {
    assetId: string;
    avatarUrl: string;
    user: {
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: string;
        status: string;
        avatarUrl: string | null;
        createdAt: string;
    };
    cleanup: {
        status: 'deleted' | 'deferred' | 'skipped';
        oldAssetId: string | null;
        deletedCount: number;
    };
}

const MEDIA_UPLOADS = `${API_BASE_URL}${API_VERSION}/media/uploads`;
const MEDIA_ASSETS = `${API_BASE_URL}${API_VERSION}/media/assets`;

export const mediaService = {
    // Xin presigned POST từ media-service để frontend upload ảnh trực tiếp lên S3 mà không đẩy binary qua backend.
    createPresignedUpload: (payload: CreatePresignedUploadPayload) =>
        authorizedAxios
            .post<PresignedUploadResponse>(`${MEDIA_UPLOADS}/presign`, payload)
            .then((response) => response.data),

    // Upload file lên S3 bằng XMLHttpRequest để bắt được tiến độ upload thật cho UI.
    uploadToPresignedPost: (
        upload: PresignedUploadResponse['upload'],
        file: File,
        onProgress?: (progress: number) => void,
    ) =>
        new Promise<void>((resolve, reject) => {
            const formData = new FormData();

            Object.entries(upload.fields).forEach(([key, value]) => {
                formData.append(key, value);
            });
            formData.append('file', file);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', upload.url);

            xhr.upload.onprogress = (event) => {
                if (!event.lengthComputable) return;
                onProgress?.(Math.round((event.loaded / event.total) * 100));
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    onProgress?.(100);
                    resolve();
                    return;
                }

                reject(new Error(`S3 upload failed with status ${xhr.status}`));
            };

            xhr.onerror = () =>
                reject(new Error('Không thể upload ảnh lên S3.'));
            xhr.send(formData);
        }),

    // Xác nhận ảnh đã resize để Media Service tự cập nhật Auth Service và dọn avatar cũ.
    confirmAvatar: (assetId: string) =>
        authorizedAxios
            .post<ConfirmAvatarResponse>(
                `${MEDIA_ASSETS}/avatar/${assetId}/confirm`,
            )
            .then((response) => response.data),

    // Yêu cầu media-service xóa ảnh gốc và các biến thể của avatar cũ thuộc user hiện tại.
    deleteAvatarAsset: (assetId: string) =>
        authorizedAxios
            .delete<DeleteMediaAssetResponse>(
                `${MEDIA_ASSETS}/avatar/${assetId}`,
            )
            .then((response) => response.data),

    // Giữ avatar hiện tại và dọn toàn bộ asset avatar cũ hoặc orphan của user đang đăng nhập.
    pruneAvatarAssets: (keepAssetId: string) =>
        authorizedAxios
            .delete<DeleteMediaAssetResponse>(`${MEDIA_ASSETS}/avatar`, {
                params: { keepAssetId },
            })
            .then((response) => response.data),
};
