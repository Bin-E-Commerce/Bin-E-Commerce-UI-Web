export type MediaUploadPurpose =
    | 'avatar'
    | 'product_image'
    | 'shop_avatar'
    | 'shop_cover'
    | 'seller_document'
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
