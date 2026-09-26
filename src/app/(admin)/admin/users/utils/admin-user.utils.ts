// Hàm trình bày dùng chung cho list/detail; chỉ định dạng dữ liệu đã có,
// không gọi API, thay đổi state hoặc quyết định quyền quản trị.

// Định dạng thời gian theo locale của hệ thống để list, session và audit hiển thị nhất quán.
export function formatAdminUserDate(
    value: string | null,
    emptyLabel = 'Chưa có',
): string {
    return value
        ? new Intl.DateTimeFormat('vi-VN', {
              dateStyle: 'medium',
              timeStyle: 'short',
          }).format(new Date(value))
        : emptyLabel;
}

// Chuyển before/after audit thành một dòng JSON dễ đọc và không làm thay đổi dữ liệu gốc.
export function renderAdminAuditJson(
    value: Record<string, unknown> | null,
): string {
    return value ? JSON.stringify(value) : '—';
}

// Dùng một bảng màu đơn sắc để trạng thái không trở thành nguồn diễn giải nghiệp vụ duy nhất.
export function getAdminUserStatusClass(): string {
    return 'bg-zinc-100 text-zinc-950';
}

// Giữ ba mức audit bằng độ tương phản khác nhau để admin quét nhanh cả khi không phân biệt màu.
export function getAdminAuditStatusClass(
    status: 'PENDING' | 'SUCCESS' | 'FAILED',
): string {
    if (status === 'SUCCESS') {
        return 'rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-700';
    }
    if (status === 'PENDING') {
        return 'rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-500';
    }
    return 'rounded-full border border-zinc-950 bg-zinc-950 px-2.5 py-1 text-xs font-semibold text-white';
}

// Chuyển action kỹ thuật thành nhãn nghiệp vụ, đồng thời fallback raw action khi backend mở rộng enum.
export function getAdminAuditActionLabel(action: string): string {
    const labels: Record<string, string> = {
        USER_ROLE_CHANGED: 'Đổi role tài khoản',
        USER_STATUS_CHANGED: 'Đổi trạng thái tài khoản',
        USER_SESSION_REVOKED: 'Thu hồi một session',
        USER_ALL_SESSIONS_REVOKED: 'Thu hồi toàn bộ session',
    };
    return labels[action] ?? action;
}
