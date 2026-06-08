import type { SessionDto } from '@/services/auth.service';
import { formatAbsoluteTime, parseUserAgent } from '@/utils/parseUserAgent';

// Kiểm tra IP có hữu ích để nhận diện thiết bị thật hay chỉ là địa chỉ local.
export function isUsefulIp(ip: string | null): ip is string {
    return Boolean(
        ip && ip !== '::1' && ip !== '127.0.0.1' && ip !== 'localhost',
    );
}

// Tạo tiêu đề dễ hiểu cho phiên, ưu tiên trình duyệt/hệ điều hành và rơi về phương thức đăng nhập.
export function getSessionTitle(session: SessionDto): string {
    const parsed = parseUserAgent(session.userAgent);
    const browserKnown = isKnown(parsed.browser);
    const osKnown = isKnown(parsed.os);

    if (browserKnown && osKnown) {
        return `${parsed.browser} trên ${parsed.os}`;
    }
    if (browserKnown) return parsed.browser;
    if (osKnown) return parsed.os;
    return session.clientId ? 'Đăng nhập bằng Google' : 'Đăng nhập bằng mật khẩu';
}

// Lấy loại thiết bị từ user-agent để chọn icon phù hợp cho thẻ phiên.
export function getSessionDeviceType(session: SessionDto): string {
    return parseUserAgent(session.userAgent).deviceType;
}

// Định dạng thời điểm đăng nhập theo dạng tương đối, ngắn gọn cho giao diện.
export function formatLoginTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 30) return `${days} ngày trước`;

    return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

// Định dạng hạn phiên theo thời gian còn lại thay vì dùng formatter quá khứ.
export function formatExpiryTime(dateStr: string): string {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff <= 0) return 'Đã hết hạn';

    const mins = Math.ceil(diff / 60000);
    const hours = Math.ceil(diff / 3600000);
    const days = Math.ceil(diff / 86400000);

    if (mins < 60) return `Còn ${mins} phút`;
    if (hours < 24) return `Còn ${hours} giờ`;
    if (days < 30) return `Còn ${days} ngày`;
    return formatAbsoluteTime(dateStr);
}

// parseUserAgent trả "Không rõ" khi không đọc được trình duyệt/hệ điều hành.
function isKnown(value: string): boolean {
    return value !== 'Không rõ';
}
