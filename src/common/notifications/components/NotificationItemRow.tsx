'use client';

import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ClipboardCheck, FilePenLine, Info, ShieldAlert } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { NotificationItem } from '@/services/notifications';

interface NotificationItemRowProps {
    notification: NotificationItem;
    onOpen: (notification: NotificationItem) => void;
}

// Chọn icon theo category; fallback Info giúp domain mới vẫn render an toàn trước khi có icon riêng.
function getNotificationIcon(category: string) {
    if (category === 'seller_application') return ClipboardCheck;
    if (category === 'shop_profile') return FilePenLine;
    if (category === 'security') return ShieldAlert;
    return Info;
}

// Một row hiển thị trạng thái đọc, nội dung ngắn và thời gian tương đối để người dùng quét nhanh trong popup.
export function NotificationItemRow({
    notification,
    onOpen,
}: NotificationItemRowProps) {
    const Icon = getNotificationIcon(notification.category);
    const unread = !notification.readAt;

    return (
        <button
            type="button"
            onClick={() => onOpen(notification)}
            className={cn(
                'relative flex w-full gap-3 border-b border-zinc-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-950',
                unread && 'bg-zinc-50/80',
            )}
        >
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                <Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="flex items-start gap-2">
                    <span className="line-clamp-1 flex-1 text-sm font-semibold text-zinc-950">
                        {notification.title}
                    </span>
                    {unread && (
                        <span
                            className="mt-1.5 size-2 shrink-0 rounded-full bg-red-500"
                            aria-label="Chưa đọc"
                        />
                    )}
                </span>
                <span className="mt-0.5 line-clamp-2 text-xs leading-5 text-zinc-600">
                    {notification.message}
                </span>
                <span className="mt-1 block text-[11px] text-zinc-400">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: vi,
                    })}
                </span>
            </span>
        </button>
    );
}
