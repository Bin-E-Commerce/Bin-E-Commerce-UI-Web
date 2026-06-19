'use client';

import { useEffect, useState } from 'react';

export function useHeaderScroll(threshold = 4) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > threshold);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, [threshold]);

    return scrolled;
}
