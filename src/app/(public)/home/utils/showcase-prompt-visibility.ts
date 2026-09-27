// Utility này lưu trạng thái đã xem popup giới thiệu theo ngày lịch của trình duyệt.
// Utility không quyết định popup có được ưu tiên trước cảnh báo hạ tầng hay không;
// quyết định đó vẫn thuộc về HomeShowcasePrompt và infrastructure-status provider.

export const SHOWCASE_PROMPT_STORAGE_KEY =
    'bin:ecommerce:showcase-prompt:last-shown-date';

let fallbackShownDate: string | null = null;

// Tạo khóa ngày theo timezone local để popup không bị hiện lại khi UTC đổi ngày
// nhưng người dùng vẫn đang ở cùng một ngày theo giờ trên thiết bị.
export function getShowcasePromptDateKey(date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// Kiểm tra popup đã được hiển thị trong ngày hiện tại chưa; fallback trong bộ nhớ
// giúp không lặp lại trong cùng phiên nếu trình duyệt chặn quyền truy cập storage.
export function hasShownShowcasePromptToday(date = new Date()): boolean {
    const today = getShowcasePromptDateKey(date);

    if (fallbackShownDate === today) return true;
    if (typeof window === 'undefined') return false;

    try {
        return (
            window.localStorage.getItem(SHOWCASE_PROMPT_STORAGE_KEY) === today
        );
    } catch {
        // Một số chế độ riêng tư có thể chặn localStorage; fallback memory vẫn
        // bảo vệ vòng đời hiện tại nhưng không thể thay thế persistence sau reload.
        return false;
    }
}

// Ghi nhận ngay sau khi state open đã được render để refresh/đổi route trong ngày
// không mở lại popup; không ghi trước bước kiểm tra ưu tiên hạ tầng.
export function markShowcasePromptShown(date = new Date()): void {
    const today = getShowcasePromptDateKey(date);
    fallbackShownDate = today;

    if (typeof window === 'undefined') return;

    try {
        window.localStorage.setItem(SHOWCASE_PROMPT_STORAGE_KEY, today);
    } catch {
        // Không làm hỏng trải nghiệm nếu storage bị chặn hoặc đầy quota.
    }
}
