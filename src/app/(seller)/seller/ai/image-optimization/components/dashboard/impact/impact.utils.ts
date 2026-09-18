// Helper thuần cho khu vực impact; file này không gọi API và không phụ thuộc React để dễ kiểm thử.

import type { ImageOptimizationImpactStatus } from '@/services/ai/types/image-optimization.types';

// Định dạng số theo locale Việt Nam, giữ dấu gạch ngang khi backend chưa có số liệu.
export function formatImpactNumber(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('vi-VN', {
        maximumFractionDigits: 1,
    }).format(value);
}

// Hiển thị phần trăm an toàn, không biến mẫu số bằng 0 thành Infinity hoặc phần trăm giả.
export function formatImpactPercent(
    value: number | null | undefined,
): string {
    if (value === null || value === undefined) return '—';
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${new Intl.NumberFormat('vi-VN', {
        maximumFractionDigits: 1,
    }).format(value)}%`;
}

// Chọn màu trung tính theo trạng thái để cảnh báo dữ liệu không bị hiểu nhầm là lỗi hệ thống.
export function getImpactStatusTone(status: ImageOptimizationImpactStatus) {
    if (status === 'READY') return 'positive';
    if (status === 'UNAVAILABLE') return 'warning';
    return 'neutral';
}
