import type { SessionDto } from '@/services/auth.service';
import { formatAbsoluteTime } from '@/utils/parseUserAgent';

// Kiểm tra IP có hữu ích để nhận diện thiết bị thật hay chỉ là địa chỉ local.
export function isUsefulIp(ip: string | null): ip is string {
    return Boolean(
        ip && ip !== '::1' && ip !== '127.0.0.1' && ip !== 'localhost',
    );
}

// Kiểm tra browser/os có đủ ý nghĩa để hiển thị hay không.
export function hasUsefulDeviceInfo(session: SessionDto): boolean {
    return session.os !== 'Không rõ' || session.browser !== 'Không rõ';
}

// Tạo tiêu đề dễ hiểu cho phiên, tránh hiển thị các chuỗi vô nghĩa như "Không rõ - Không rõ".
export function getSessionTitle(session: SessionDto): string {
    if (session.deviceName && session.deviceName !== 'Không rõ - Không rõ') {
        return session.deviceName;
    }
    if (hasUsefulDeviceInfo(session)) {
        return `${session.os} - ${session.browser}`;
    }
    return session.loginMethod === 'google'
        ? 'Đăng nhập bằng Google'
        : 'Đăng nhập bằng mật khẩu';
}

// Lấy loại thiết bị để chọn icon phù hợp cho thẻ phiên.
export function getSessionDeviceType(session: SessionDto): string {
    return session.deviceType || 'desktop';
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
