// Điều hướng đến anchor trong tài liệu showcase; helper này không sở hữu nội dung, state hay dữ liệu runtime.
import type { MouseEvent } from 'react';

const highlightTimers = new WeakMap<
    HTMLElement,
    { fade: number; cleanup: number }
>();

// Mở disclosure cha trước khi cuộn, giữ URL hash mặc định và nhấn viền đích trong thời gian ngắn để người đọc nhận biết vị trí.
// Nếu anchor không tồn tại thì giữ nguyên hành vi link mặc định, tránh làm hỏng điều hướng khi một section bị thay đổi.
export function handleShowcaseAnchorNavigation(
    event: MouseEvent<HTMLAnchorElement>,
) {
    const targetId = event.currentTarget.hash.slice(1);
    const target = document.getElementById(targetId);

    if (!(target instanceof HTMLElement)) return;

    let disclosure = target.closest('details');
    while (disclosure) {
        disclosure.open = true;
        disclosure = disclosure.parentElement?.closest('details') ?? null;
    }

    window.requestAnimationFrame(() => {
        target.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
                .matches
                ? 'auto'
                : 'smooth',
            block: 'start',
        });
        target.focus({ preventScroll: true });

        // Hủy timer cũ để người dùng click liên tiếp vẫn luôn thấy đúng anchor vừa chọn.
        const previousTimers = highlightTimers.get(target);
        if (previousTimers) {
            window.clearTimeout(previousTimers.fade);
            window.clearTimeout(previousTimers.cleanup);
        }

        const highlightClasses = [
            'outline',
            'outline-2',
            'outline-zinc-500',
            'outline-offset-2',
            'transition-[outline-color]',
            'duration-300',
        ];
        target.classList.remove(...highlightClasses);
        void target.offsetWidth;
        target.classList.add(...highlightClasses);

        const fade = window.setTimeout(() => {
            target.classList.replace('outline-zinc-500', 'outline-transparent');
            const cleanup = window.setTimeout(() => {
                target.classList.remove(
                    ...highlightClasses,
                    'outline-transparent',
                );
                highlightTimers.delete(target);
            }, 350);
            highlightTimers.set(target, { fade, cleanup });
        }, 1500);
        highlightTimers.set(target, { fade, cleanup: 0 });
    });
}
