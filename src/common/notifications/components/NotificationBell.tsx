'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Loader2, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type {
    NotificationItem,
    NotificationReadStatus,
} from '@/services/notifications';
import { cn } from '@/lib/utils';
import { useNotificationCounts } from '../hooks/useNotificationCounts';
import {
    useMarkAllNotificationsRead,
    useMarkNotificationRead,
    useNotifications,
} from '../hooks/useNotifications';
import { NotificationItemRow } from './NotificationItemRow';

// Chuông thông báo kết hợp unread count, feed phân trang và thao tác đọc trong một popover gọn trên topbar.
export function NotificationBell() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<NotificationReadStatus>('all');
    const counts = useNotificationCounts();
    const feed = useNotifications(status, open);
    const markRead = useMarkNotificationRead();
    const markAllRead = useMarkAllNotificationsRead();
    const totalUnread = counts.data?.total ?? 0;
    const items = useMemo(
        () => feed.data?.pages.flatMap((page) => page.items) ?? [],
        [feed.data],
    );
    const isLoadingEmptyFeed = items.length === 0 && feed.isFetching;

    // Khi mở chuông, count được làm mới trực tiếp; feed tự tải lại vì hook chỉ bật lúc popup mở và luôn ở trạng thái stale.
    function handlePopoverOpenChange(nextOpen: boolean) {
        setOpen(nextOpen);
        if (!nextOpen) return;

        void counts.refetch();
    }

    // Đóng popup trước khi điều hướng; mark-read chạy nền và cache sẽ được đồng bộ khi mutation hoàn tất.
    function handleOpenNotification(notification: NotificationItem) {
        setOpen(false);
        if (!notification.readAt) {
            markRead.mutate(notification.id);
        }
        if (notification.actionUrl) {
            router.push(notification.actionUrl);
        }
    }

    return (
        <Popover open={open} onOpenChange={handlePopoverOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label={
                        totalUnread > 0
                            ? `${totalUnread} thông báo chưa đọc`
                            : 'Thông báo'
                    }
                >
                    <Bell className="size-5" />
                    {totalUnread > 0 && (
                        <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-4 text-white ring-2 ring-white">
                            {totalUnread > 99 ? '99+' : totalUnread}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent align="end" sideOffset={10} className="w-[min(390px,calc(100vw-24px))] overflow-hidden p-0">
                <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
                    <div>
                        <p className="text-sm font-semibold text-zinc-950">Thông báo</p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                            {totalUnread > 0
                                ? `${totalUnread} nội dung chưa đọc`
                                : 'Bạn đã xem hết thông báo'}
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        disabled={totalUnread === 0 || markAllRead.isPending}
                        onClick={() => markAllRead.mutate()}
                    >
                        {markAllRead.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <CheckCheck className="size-4" />
                        )}
                        Đọc tất cả
                    </Button>
                </div>

                <div className="flex gap-1 border-b border-zinc-100 px-4 py-2">
                    {(['all', 'unread'] as NotificationReadStatus[]).map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setStatus(value)}
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                status === value
                                    ? 'bg-zinc-950 text-white'
                                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950',
                            )}
                        >
                            {value === 'all' ? 'Tất cả' : 'Chưa đọc'}
                            {value === 'unread' && totalUnread > 0 ? (
                                <span className={cn(
                                    'min-w-4 rounded-full px-1 text-[10px] font-bold leading-4',
                                    status === value ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600',
                                )}>
                                    {totalUnread > 99 ? '99+' : totalUnread}
                                </span>
                            ) : null}
                        </button>
                    ))}
                </div>

                <div className="max-h-[430px] overflow-y-auto">
                    {feed.isError && items.length === 0 ? (
                        <div className="flex h-44 flex-col items-center justify-center px-6 text-center">
                            <Bell className="size-6 text-zinc-300" />
                            <p className="mt-3 text-sm font-medium text-zinc-800">
                                Không thể tải thông báo
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                                Kết nối tới dịch vụ thông báo đang gián đoạn. Vui lòng thử lại.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-3 gap-1.5"
                                onClick={() => void feed.refetch()}
                            >
                                <RefreshCw className="size-3.5" />
                                Thử lại
                            </Button>
                        </div>
                    ) : feed.isLoading || isLoadingEmptyFeed ? (
                        <div className="flex h-40 items-center justify-center text-zinc-500">
                            <Loader2 className="size-5 animate-spin" />
                            <span className="ml-2 text-sm">Đang tải thông báo...</span>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex h-40 flex-col items-center justify-center px-6 text-center">
                            <Bell className="size-6 text-zinc-300" />
                            <p className="mt-3 text-sm font-medium text-zinc-700">
                                Chưa có thông báo
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                                Thông tin mới cần xử lý sẽ xuất hiện tại đây.
                            </p>
                        </div>
                    ) : (
                        <>
                            {items.map((notification) => (
                                <NotificationItemRow
                                    key={notification.id}
                                    notification={notification}
                                    onOpen={handleOpenNotification}
                                />
                            ))}
                            {feed.hasNextPage && (
                                <div className="p-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        disabled={feed.isFetchingNextPage}
                                        onClick={() => void feed.fetchNextPage()}
                                    >
                                        {feed.isFetchingNextPage
                                            ? 'Đang tải thêm...'
                                            : 'Xem thêm'}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
