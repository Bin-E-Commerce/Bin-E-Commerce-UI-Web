// Hook UI tạo hiệu ứng confetti khi một luồng giao diện hoàn thành thành công.
// Hook không chứa business logic; component gọi fire tại đúng thời điểm cần phản hồi trực quan cho người dùng.

'use client';

import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti() {
    // Chạy hai luồng hạt từ hai phía màn hình trong một khoảng thời gian ngắn để tạo hiệu ứng nhẹ và có điểm dừng.
    const fire = useCallback(() => {
        const end = Date.now() + 2500;
        const colors = ['#a786ff', '#fd8bbc', '#ffe29f', '#60a5fa', '#34d399'];

        // Lặp theo animation frame thay vì setInterval để trình duyệt tự điều tiết theo nhịp render.
        const frame = () => {
            if (Date.now() > end) return;
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                startVelocity: 60,
                origin: { x: 0, y: 0.65 },
                colors,
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                startVelocity: 60,
                origin: { x: 1, y: 0.65 },
                colors,
            });
            requestAnimationFrame(frame);
        };
        frame();
    }, []);

    return { fire };
}
