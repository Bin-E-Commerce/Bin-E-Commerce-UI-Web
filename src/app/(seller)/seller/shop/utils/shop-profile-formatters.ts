import type { PresignedUploadResponse } from '@/services/media';

const BUSINESS_MODEL_LABELS: Record<string, string> = {
    retail: 'Bán lẻ',
    brand: 'Thương hiệu chính hãng',
    distributor: 'Nhà phân phối',
};

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
    citizenIdFront: 'CCCD mặt trước',
    citizenIdBack: 'CCCD mặt sau',
    businessLicense: 'Giấy phép kinh doanh',
};

const PROFILE_TYPE_LABELS: Record<string, string> = {
    individual: 'Cá nhân / Hộ kinh doanh',
    business: 'Doanh nghiệp',
};

// Chuyển mã mô hình bán hàng thành nhãn nghiệp vụ dễ đọc và vẫn có fallback cho dữ liệu mở rộng sau này.
export function formatBusinessModel(value: string): string {
    return BUSINESS_MODEL_LABELS[value] ?? value;
}

// Chuyển mã loại giấy tờ thành nhãn hiển thị, tránh để người bán nhìn thấy key kỹ thuật từ JSONB.
export function formatDocumentType(value: string): string {
    return DOCUMENT_TYPE_LABELS[value] ?? value;
}

// Chuyển loại hồ sơ pháp lý thành cách gọi nhất quán giữa tab thuế và tab định danh.
export function formatProfileType(value: string): string {
    return PROFILE_TYPE_LABELS[value] ?? value;
}

// Định dạng thời gian theo locale Việt Nam để toàn bộ tab dùng cùng một quy ước ngày giờ.
export function formatShopProfileDate(value: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(value));
}

// Suy ra URL ảnh medium từ object key gốc theo contract cố định giữa media-service và Lambda resize.
export function buildProcessedShopLogoUrl(
    presigned: PresignedUploadResponse,
): string {
    if (!presigned.publicBaseUrl) {
        throw new Error('Media CDN chưa được cấu hình.');
    }

    const [, , purpose, ownerId, assetId] = presigned.objectKey.split('/');
    if (!purpose || !ownerId || !assetId) {
        throw new Error('Đường dẫn upload logo không hợp lệ.');
    }

    return [
        presigned.publicBaseUrl.replace(/\/$/, ''),
        'media',
        'processed',
        purpose,
        ownerId,
        assetId,
        'medium.webp',
    ].join('/');
}
