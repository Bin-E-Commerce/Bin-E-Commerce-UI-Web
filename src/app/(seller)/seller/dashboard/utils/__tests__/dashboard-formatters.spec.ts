// Unit test cho formatter dashboard để số tiền và phần trăm không bị hiển thị sai trong UI vận hành.

import {
    formatDashboardChange,
    formatDashboardMoney,
    getDashboardOrderStatusLabel,
} from '../dashboard-formatters';

describe('dashboard-formatters', () => {
    // Doanh thu phải luôn hiển thị theo tiền Việt và không có phần thập phân.
    it('formats gross revenue as Vietnamese currency', () => {
        expect(formatDashboardMoney(1250000)).toContain('1.250.000');
        expect(formatDashboardMoney(1250000)).toContain('₫');
    });

    // Kỳ trước bằng 0 không được hiển thị phần trăm tăng trưởng giả.
    it('keeps unavailable comparison explicit', () => {
        expect(formatDashboardChange(null)).toBe('Chưa có kỳ so sánh');
        expect(formatDashboardChange(12.5)).toBe('+12.5% so với kỳ trước');
    });

    // Trạng thái kỹ thuật từ backend phải được dịch ngay tại boundary hiển thị.
    it('maps order status to Vietnamese labels', () => {
        expect(getDashboardOrderStatusLabel('TO_SHIP')).toBe('Chờ giao');
        expect(getDashboardOrderStatusLabel('UNKNOWN')).toBe('UNKNOWN');
    });
});
