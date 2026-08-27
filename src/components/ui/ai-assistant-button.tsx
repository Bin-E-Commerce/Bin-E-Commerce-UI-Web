'use client';

// File này cung cấp primitive UI cho biểu tượng và nút kích hoạt trợ lý AI dùng chung.
// Component chỉ chịu trách nhiệm hiển thị asset, tooltip và trạng thái tương tác; nó không
// biết nghiệp vụ AI hay tự gọi API. Tooltip tự nhắc lại theo chu kỳ nhưng không chặn pointer
// event của trang, nên có thể tái sử dụng an toàn trong form, modal và bảng dữ liệu.

import Image from 'next/image';
import {
    useEffect,
    useId,
    useState,
    type AriaAttributes,
    type MouseEventHandler,
} from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TOOLTIP_INITIAL_DELAY_MS = 3_000;
const TOOLTIP_VISIBLE_DURATION_MS = 3_500;

interface AiAssistantIconProps {
    className?: string;
    size?: number;
}

interface AiAssistantButtonProps {
    tooltip: string;
    ariaLabel?: string;
    ariaHasPopup?: AriaAttributes['aria-haspopup'];
    ariaExpanded?: boolean;
    disabled?: boolean;
    className?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
}

// Hiển thị đúng asset AI dùng chung, không chứa hành vi hoặc trạng thái nghiệp vụ.
export function AiAssistantIcon({ className, size = 18 }: AiAssistantIconProps) {
    return (
        <Image
            src="/images/icon/ai-icon.svg"
            alt=""
            aria-hidden="true"
            width={size}
            height={size}
            className={cn('shrink-0 object-contain', className)}
        />
    );
}

// Tạo nút AI có tooltip tự nhắc lại, đồng thời hỗ trợ hover/focus và aria-describedby.
export function AiAssistantButton({
    tooltip,
    ariaLabel = 'Mở trợ lý AI',
    ariaHasPopup,
    ariaExpanded,
    disabled = false,
    className,
    onClick,
}: AiAssistantButtonProps) {
    const tooltipId = useId();
    const [autoVisible, setAutoVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Lặp chu kỳ nhắc tooltip bằng setTimeout thay vì setInterval để mỗi lần hiển thị
    // có thời lượng độc lập; cleanup đầy đủ giúp không còn timer chạy sau khi unmount.
    useEffect(() => {
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout>;

        // Đặt lịch hiển thị rồi tự ẩn tooltip; gọi đệ quy sau mỗi chu kỳ để nhắc lại ổn định.
        const scheduleTooltip = () => {
            timer = setTimeout(() => {
                if (cancelled) return;

                setAutoVisible(true);
                timer = setTimeout(() => {
                    if (cancelled) return;

                    setAutoVisible(false);
                    scheduleTooltip();
                }, TOOLTIP_VISIBLE_DURATION_MS);
            }, TOOLTIP_INITIAL_DELAY_MS);
        };

        scheduleTooltip();

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    const tooltipVisible = autoVisible || isHovered || isFocused;

    // Giữ tooltip mở khi người dùng đang hover hoặc điều hướng bằng bàn phím.
    // Không thay đổi autoVisible để chu kỳ tự động vẫn tiếp tục sau khi rời con trỏ.
    // Xác định trạng thái hover để tooltip không biến mất khi người dùng đọc nội dung.
    const handlePointerEnter = () => setIsHovered(true);
    // Kết thúc trạng thái hover, nhưng vẫn giữ tooltip nếu chu kỳ tự động đang hiển thị.
    const handlePointerLeave = () => setIsHovered(false);
    // Giữ tooltip hiển thị khi người dùng tab tới nút để hỗ trợ keyboard accessibility.
    const handleFocus = () => setIsFocused(true);
    // Xóa trạng thái focus sau khi người dùng rời nút bằng bàn phím hoặc chuột.
    const handleBlur = () => setIsFocused(false);

    return (
        <span
            className="relative inline-flex"
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
        >
            <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className={cn(
                    'border-zinc-300 bg-white text-zinc-950 shadow-sm hover:border-zinc-950 hover:bg-zinc-100',
                    className,
                )}
                disabled={disabled}
                onClick={onClick}
                onFocus={handleFocus}
                onBlur={handleBlur}
                aria-label={ariaLabel}
                aria-describedby={tooltipId}
                aria-haspopup={ariaHasPopup}
                aria-expanded={ariaExpanded}
            >
                <AiAssistantIcon />
            </Button>
            <span
                id={tooltipId}
                role="tooltip"
                aria-hidden={!tooltipVisible}
                className={cn(
                    'pointer-events-none absolute bottom-full right-0 z-40 mb-2 w-64 rounded-lg bg-zinc-950 px-3 py-2 text-left text-xs leading-5 text-white shadow-lg transition-[opacity,visibility] duration-200',
                    tooltipVisible ? 'visible opacity-100' : 'invisible opacity-0',
                )}
            >
                <span
                    aria-hidden="true"
                    className="absolute -bottom-1 right-3 size-2 rotate-45 bg-zinc-950"
                />
                {tooltip}
            </span>
        </span>
    );
}
