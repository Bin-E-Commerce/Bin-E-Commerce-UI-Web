// Lưu một số query gần đây trong trình duyệt hiện tại; không gửi lịch sử này lên server.

const RECENT_SEARCHES_KEY = 'bin-ecommerce:recent-product-searches';
const RECENT_SEARCHES_LIMIT = 5;

// Đọc lịch sử có kiểm tra dữ liệu vì localStorage có thể bị tắt hoặc bị ghi giá trị sai định dạng.
export function readRecentSearches(): string[] {
    if (typeof window === 'undefined') return [];

    try {
        const parsed: unknown = JSON.parse(
            window.localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]',
        );
        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter(
                (value): value is string =>
                    typeof value === 'string' && value.trim().length > 0,
            )
            .map((value) => value.trim())
            .slice(0, RECENT_SEARCHES_LIMIT);
    } catch {
        return [];
    }
}

// Đưa query mới nhất lên đầu và loại các lần lặp để lịch sử luôn ngắn, ổn định.
export function rememberRecentSearch(query: string): string[] {
    const normalizedQuery = query.trim();
    if (!normalizedQuery || typeof window === 'undefined')
        return readRecentSearches();

    const next = [
        normalizedQuery,
        ...readRecentSearches().filter(
            (item) =>
                item.toLocaleLowerCase('vi-VN') !==
                normalizedQuery.toLocaleLowerCase('vi-VN'),
        ),
    ].slice(0, RECENT_SEARCHES_LIMIT);

    try {
        window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    } catch {
        // Lịch sử chỉ là tiện ích UX; lỗi quota/privacy không ngăn việc tìm kiếm.
    }

    return next;
}

// Xóa mọi biến thể hoa/thường của một query và trả danh sách mới để UI cập nhật ngay.
export function removeRecentSearch(query: string): string[] {
    const normalizedQuery = query.trim();
    // Query rỗng không đại diện cho mục hợp lệ; SSR cũng không được truy cập localStorage.
    if (!normalizedQuery || typeof window === 'undefined') {
        return readRecentSearches();
    }

    // Lọc không phân biệt hoa/thường để không giữ lại bản trùng cũ trong storage.
    const next = readRecentSearches().filter(
        (item) =>
            item.toLocaleLowerCase('vi-VN') !==
            normalizedQuery.toLocaleLowerCase('vi-VN'),
    );

    try {
        if (next.length > 0) {
            window.localStorage.setItem(
                RECENT_SEARCHES_KEY,
                JSON.stringify(next),
            );
        } else {
            window.localStorage.removeItem(RECENT_SEARCHES_KEY);
        }
    } catch {
        // UI vẫn nhận danh sách đã lọc dù trình duyệt chặn thao tác lưu trữ.
    }

    return next;
}

// Xóa lịch sử của trình duyệt hiện tại mà không ảnh hưởng query đang nhập.
export function clearRecentSearches(): void {
    if (typeof window === 'undefined') return;

    try {
        window.localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
        // UI vẫn đóng/hoạt động ngay cả khi browser chặn quyền lưu trữ.
    }
}
