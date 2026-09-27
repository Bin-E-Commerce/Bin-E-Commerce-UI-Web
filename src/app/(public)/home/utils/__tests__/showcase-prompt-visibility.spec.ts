// Test bảo vệ contract popup giới thiệu: một ngày chỉ ghi nhận một lần,
// ngày kế tiếp được phép hiển thị lại và khóa ngày dùng timezone local.

import {
    getShowcasePromptDateKey,
    hasShownShowcasePromptToday,
    markShowcasePromptShown,
    SHOWCASE_PROMPT_STORAGE_KEY,
} from '../showcase-prompt-visibility';

describe('showcase prompt visibility', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('shows at most once per local calendar day', () => {
        const today = new Date(2026, 8, 27, 10, 0);
        const tomorrow = new Date(2026, 8, 28, 10, 0);

        expect(hasShownShowcasePromptToday(today)).toBe(false);

        markShowcasePromptShown(today);

        expect(hasShownShowcasePromptToday(today)).toBe(true);
        expect(hasShownShowcasePromptToday(tomorrow)).toBe(false);
        expect(window.localStorage.getItem(SHOWCASE_PROMPT_STORAGE_KEY)).toBe(
            getShowcasePromptDateKey(today),
        );
    });
});
