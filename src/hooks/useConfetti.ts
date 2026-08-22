'use client';

// Mục đích file này là để tạo custom hook useConfetti,
// cung cấp hàm fire để bắn hiệu ứng confetti khi người dùng thực hiện một hành động nào đó (ví dụ: hoàn thành đơn hàng, đăng ký thành công, v.v...)

import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti() {
    const fire = useCallback(() => {
        const end = Date.now() + 2500;
        const colors = ['#a786ff', '#fd8bbc', '#ffe29f', '#60a5fa', '#34d399'];

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
