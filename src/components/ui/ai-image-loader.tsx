// Loader dùng cho các trạng thái AI đang phân tích hoặc tạo ảnh.
// Component không phụ thuộc vào một feature cụ thể để có thể dùng lại trong
// dialog, card trạng thái và các màn hình AI khác.

'use client';

import { useId } from 'react';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface AiImageLoaderProps {
    // Kích thước hình loader theo pixel.
    size?: number;
    // Nội dung hỗ trợ đọc bằng screen reader và hiển thị dưới loader.
    label?: string;
    className?: string;
    // Chọn bảng màu sáng khi loader nằm trên nền tối.
    tone?: 'dark' | 'light';
}

// Hiển thị animation hình học khi AI chưa trả về ảnh kết quả.
export function AiImageLoader({
    size = 96,
    label = 'Đang tạo ảnh...',
    className,
    tone = 'dark',
}: AiImageLoaderProps) {
    const maskId = `ai-image-loader-${useId().replace(/:/g, '')}`;
    // Clip riêng các polygon trắng để chúng luôn nằm trong vùng an toàn của vòng tròn.
    const clipId = `${maskId}-inner-clip`;
    const loaderStyle = {
        '--ai-loader-size': `${size}px`,
        '--ai-loader-mask': `url(#${maskId})`,
    } as CSSProperties;

    return (
        <div
            className={cn(
                'flex flex-col items-center gap-4 text-center',
                tone === 'light' ? 'text-zinc-300' : 'text-zinc-600',
                className,
            )}
            role="status"
            aria-live="polite"
        >
            <div
                className={cn(
                    'ai-image-loader',
                    tone === 'light' && 'ai-image-loader--light',
                )}
                style={loaderStyle}
                aria-hidden="true"
            >
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 100 100"
                    focusable="false"
                >
                    <defs>
                        {/* Bán kính nhỏ hơn vòng ngoài giúp animation không bị lẹm vào viền. */}
                        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                            <circle cx="50" cy="50" r="36" />
                        </clipPath>
                        <mask id={maskId} className="ai-image-loader__mask">
                            <polygon
                                points="0,0 100,0 100,100 0,100"
                                fill="black"
                            />
                            <g clipPath={`url(#${clipId})`}>
                                <polygon
                                    points="25,25 75,25 50,75"
                                    fill="white"
                                />
                                <polygon
                                    points="50,25 75,75 25,75"
                                    fill="white"
                                />
                                <polygon
                                    points="35,35 65,35 50,65"
                                    fill="white"
                                />
                                <polygon
                                    points="35,35 65,35 50,65"
                                    fill="white"
                                />
                                <polygon
                                    points="35,35 65,35 50,65"
                                    fill="white"
                                />
                                <polygon
                                    points="35,35 65,35 50,65"
                                    fill="white"
                                />
                            </g>
                        </mask>
                    </defs>
                </svg>
                <div className="ai-image-loader__box" />
            </div>
            <span className="text-sm font-medium">{label}</span>
        </div>
    );
}
