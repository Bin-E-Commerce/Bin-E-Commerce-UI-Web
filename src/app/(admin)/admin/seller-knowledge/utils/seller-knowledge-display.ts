// Chuẩn hóa nhãn và ngày tháng cho giao diện quản trị; không thay đổi trạng thái nghiệp vụ từ API.

import type {
    SellerKnowledgeDocument,
    SellerKnowledgeDomain,
} from '@/services/admin';

// Chuẩn hóa tên tài liệu/nhóm thành mã URL ổn định; không áp dụng thay đổi lên mã admin đã tự chỉnh.
export function createKnowledgeSlug(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/gu, '')
        .replace(/[^a-z0-9]+/gu, '-')
        .replace(/^-|-$/gu, '');
}

// Đổi trạng thái nội bộ thành nhãn tiếng Việt dễ hiểu mà không đưa mã trạng thái lên giao diện.
export function getDocumentStatusLabel(
    status: SellerKnowledgeDocument['status'],
): string {
    switch (status) {
        case 'PUBLISHED':
            return 'Đã xuất bản';
        case 'EXPIRED':
            return 'Hết hiệu lực';
        case 'ARCHIVED':
            return 'Đã lưu trữ';
        default:
            return 'Bản nháp';
    }
}

// Dùng màu đơn sắc cho trạng thái thông thường; đỏ chỉ dành cho trạng thái lỗi/nguy hiểm.
export function getDocumentStatusClass(
    status: SellerKnowledgeDocument['status'],
): string {
    switch (status) {
        case 'PUBLISHED':
            return 'border-foreground bg-foreground text-background';
        case 'EXPIRED':
            return 'border-border bg-muted/60 text-muted-foreground';
        case 'ARCHIVED':
            return 'border-border bg-muted text-muted-foreground';
        default:
            return 'border-border bg-background text-foreground';
    }
}

// Đồng bộ màu nhóm nội dung với badge tài liệu: đang dùng nổi bật đơn sắc, nháp/lưu trữ giữ sắc độ trung tính.
export function getDomainStatusClass(
    status: SellerKnowledgeDomain['status'],
): string {
    switch (status) {
        case 'ACTIVE':
            return 'border-foreground bg-foreground text-background';
        case 'ARCHIVED':
            return 'border-border bg-muted text-muted-foreground';
        default:
            return 'border-border bg-background text-foreground';
    }
}

// Hiển thị ngày cập nhật theo múi giờ Việt Nam để admin đọc danh sách nhất quán với nghiệp vụ trong nước.
export function formatKnowledgeDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Chưa có thông tin';

    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeZone: 'Asia/Ho_Chi_Minh',
    }).format(date);
}
