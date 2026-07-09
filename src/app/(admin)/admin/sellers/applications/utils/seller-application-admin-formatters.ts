import type { SellerApplicationDto, SellerApplicationStatus } from '@/services/seller';

// Chuyển trạng thái kỹ thuật thành nhãn ngắn để bảng admin dễ đọc.
export function formatSellerApplicationStatus(status: SellerApplicationStatus): string {
    switch (status) {
        case 'draft':
            return 'Bản nháp';
        case 'pending_review':
            return 'Chờ duyệt';
        case 'approved':
            return 'Đã duyệt';
        case 'rejected':
            return 'Từ chối';
        default:
            return status;
    }
}

// Định dạng thời gian theo locale Việt Nam, trả dấu gạch khi chưa có mốc thời gian.
export function formatAdminDateTime(value: string | null): string {
    if (!value) return '-';

    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(value));
}

// Ưu tiên tên shop, nếu hồ sơ chưa nhập tên thì hiển thị slug hoặc nhãn fallback cho admin.
export function getApplicationShopDisplayName(application: SellerApplicationDto): string {
    return application.shop.name ?? application.shop.slug ?? 'Chưa đặt tên shop';
}

// Tạo mô tả ngắn về người bán để admin nhận diện hồ sơ trong danh sách.
export function getApplicationOwnerSummary(application: SellerApplicationDto): string {
    return (
        application.seller.legalName ??
        application.seller.representativeName ??
        application.seller.email ??
        'Chưa có thông tin người bán'
    );
}
