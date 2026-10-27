// Định dạng số tiền finance; dữ liệu thiếu hoặc không hợp lệ hiển thị 0 thay vì NaN.

// Chuẩn hóa số từ API trước khi định dạng, giữ nguyên fallback an toàn của dashboard admin.
export function formatMoney(amount: string | null | undefined): string {
    const parsedAmount = Number(amount ?? 0);
    const safeAmount = Number.isFinite(parsedAmount) ? parsedAmount : 0;
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(safeAmount);
}
