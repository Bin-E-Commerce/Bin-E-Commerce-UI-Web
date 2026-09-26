// Formatter thuần cho dashboard, giữ format tiền/ngày nhất quán giữa các card.

export function formatDashboardMoney(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(value);
}

export function formatDashboardNumber(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value);
}

export function formatDashboardDate(value: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh',
    }).format(new Date(value));
}

export function formatDashboardDay(value: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh',
    }).format(new Date(`${value}T00:00:00+07:00`));
}

export function formatDashboardChange(value: number | null): string {
    if (value === null) return 'Chưa có kỳ so sánh';
    if (value === 0) return 'Không đổi so với kỳ trước';
    return `${value > 0 ? '+' : ''}${value}% so với kỳ trước`;
}

export function getDashboardOrderStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        PENDING: 'Chờ xác nhận',
        TO_SHIP: 'Chờ giao',
        SHIPPING: 'Đang giao',
        DELIVERED: 'Đã giao',
        COMPLETED: 'Hoàn thành',
        CANCELLED: 'Đã hủy',
        RETURN_REFUND: 'Trả hàng / hoàn tiền',
    };
    return labels[status] ?? status;
}
