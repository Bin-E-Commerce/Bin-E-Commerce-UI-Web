// Primitive tooltip dùng chung cho các nội dung bị rút gọn nhưng vẫn cần đọc đầy đủ.
// Component bọc Radix Tooltip để giữ accessibility, portal và animation nhất quán với design system.

'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';

// Cấu hình thời gian chờ chung để tooltip không bật quá nhanh khi người dùng chỉ lướt qua.
function TooltipProvider({
    delayDuration = 200,
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
    return (
        <TooltipPrimitive.Provider
            data-slot="tooltip-provider"
            delayDuration={delayDuration}
            {...props}
        />
    );
}

// Bọc trạng thái mở/đóng tooltip theo API của Radix.
function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
    return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

// Cho phép bất kỳ phần tử trình bày nào làm vùng hover/focus mà không tạo DOM lồng không hợp lệ.
function TooltipTrigger(
    props: React.ComponentProps<typeof TooltipPrimitive.Trigger>,
) {
    return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

// Hiển thị nội dung đầy đủ trong portal để tooltip không bị cắt bởi card hoặc lưới sản phẩm.
function TooltipContent({
    className,
    sideOffset = 6,
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
    return (
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
                data-slot="tooltip-content"
                sideOffset={sideOffset}
                className={cn(
                    'z-50 max-w-xs rounded-lg bg-zinc-950 px-3 py-2 text-xs leading-5 text-white shadow-lg outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                    className,
                )}
                {...props}
            />
        </TooltipPrimitive.Portal>
    );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
