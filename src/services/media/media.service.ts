import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    ConfirmAvatarResponse,
    CreatePresignedUploadPayload,
    DeleteMediaAssetResponse,
    PresignedUploadResponse,
} from './types/media.types';

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

