'use client';

import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    ClipboardCheck,
    FilePenLine,
    Info,
    PackageCheck,
    ShieldAlert,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { NotificationItem } from '@/services/notifications';

interface NotificationItemRowProps {
    notification: NotificationItem;
    onOpen: (notification: NotificationItem) => void;
}

// Chọn icon theo category bằng các nhánh JSX tĩnh để React không khởi tạo lại component icon trong mỗi lần render.
function NotificationIcon({ category }: { category: string }) {
    if (category === 'seller_application') return <ClipboardCheck className="size-4" />;
    if (category === 'shop_profile') return <FilePenLine className="size-4" />;
    if (category === 'order') return <PackageCheck className="size-4" />;
    if (category === 'security') return <ShieldAlert className="size-4" />;
    return <Info className="size-4" />;
}

// Một row hiển thị trạng thái đọc, nội dung ngắn và thời gian tương đối để người dùng quét nhanh trong popup.
export function NotificationItemRow({
    notification,
    onOpen,
}: NotificationItemRowProps) {
    const unread = !notification.readAt;

    return (
        <button
            type="button"
            onClick={() => onOpen(notification)}
            className={cn(
                'relative flex w-full gap-3 border-b border-zinc-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-950',
                unread && 'bg-zinc-50/90 shadow-[inset_3px_0_0_#18181b]',
            )}
        >
            <span className={cn(
                'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg',
                unread ? 'bg-zinc-950 text-white shadow-sm' : 'bg-zinc-100 text-zinc-700',
            )}>
                <NotificationIcon category={notification.category} />
            </span>
            <span className="min-w-0 flex-1">
                <span className="flex items-start gap-2">
                    <span className={cn(
                        'line-clamp-1 flex-1 text-sm text-zinc-950',
                        unread ? 'font-bold' : 'font-semibold',
                    )}>
                        {notification.title}
                    </span>
                    {unread && (
                        <span
                            className="mt-1.5 size-2.5 shrink-0 rounded-full bg-red-500 ring-2 ring-red-100"
                            aria-label="Chưa đọc"
                        />
                    )}
                </span>
                <span className="mt-0.5 line-clamp-2 text-xs leading-5 text-zinc-600">
                    {notification.message}
                </span>
                <span className={cn(
                    'mt-1 block text-[11px]',
                    unread ? 'font-medium text-zinc-600' : 'text-zinc-400',
                )}>
                    {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: vi,
                    })}
                </span>
            </span>
        </button>
    );
}
