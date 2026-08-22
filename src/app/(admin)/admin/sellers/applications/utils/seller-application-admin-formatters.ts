import type {
    PayoutAccountType,
    SellerApplicationDto,
    SellerApplicationStatus,
    SellerProfileType,
} from '@/services/seller';

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

// Chuẩn hóa giá trị rỗng để trang chi tiết không hiện null/undefined thô cho admin.
export function formatNullableText(value: string | null | undefined): string {
    return value?.trim() ? value : 'Chưa cung cấp';
}

// Đổi loại hồ sơ seller thành tiếng Việt đúng ngữ cảnh duyệt.
export function formatSellerProfileType(type: SellerProfileType): string {
    return type === 'business' ? 'Doanh nghiệp' : 'Cá nhân / Hộ kinh doanh';
}

// Đổi mô hình bán hàng được lưu trong form thành nhãn nghiệp vụ dễ hiểu.
export function formatBusinessModel(model: string | null): string {
    switch (model) {
        case 'retail':
            return 'Bán lẻ';
        case 'brand':
            return 'Thương hiệu';
        case 'distributor':
            return 'Nhà phân phối';
        default:
            return formatNullableText(model);
    }
}

// Đổi loại tài khoản nhận tiền thành nhãn rõ ràng cho bước đối soát.
export function formatPayoutAccountType(type: PayoutAccountType): string {
    return type === 'business' ? 'Tài khoản doanh nghiệp' : 'Tài khoản cá nhân';
}

// Che bớt thông tin định danh để admin vẫn đối chiếu được mà không phơi toàn bộ dữ liệu nhạy cảm trên màn hình.
export function maskIdentityValue(value: string | null | undefined): string {
    if (!value) return 'Chưa cung cấp';
    if (value.length <= 4) return value;

    return `${'*'.repeat(Math.max(value.length - 4, 0))}${value.slice(-4)}`;
}
