export type MediaUploadPurpose =
    | 'avatar'
    | 'product_image'
    | 'product_video'
    | 'shop_avatar'
    | 'shop_cover'
    | 'seller_document'
    | 'review_image'
    | 'review_video'
    | 'chat_image';

export type MediaUploadMimeType =
    | 'image/jpeg'
    | 'image/png'
    | 'image/webp'
    | 'video/mp4'
    | 'video/webm';

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

export type ProductMediaCleanupPurpose = 'product_image' | 'product_video';

export interface ProductMediaCleanupAsset {
    assetId: string;
    purpose: ProductMediaCleanupPurpose;
}

export interface CleanupProductAssetsResponse {
    requestedAssetCount: number;
    deletedCount: number;
}

export type ReviewMediaCleanupPurpose = 'review_image' | 'review_video';

export interface ReviewMediaCleanupAsset {
    assetId: string;
    purpose: ReviewMediaCleanupPurpose;
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
