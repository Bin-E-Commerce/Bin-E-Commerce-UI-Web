'use client';

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import * as React from 'react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AlertDialogDismissContext = React.createContext<(() => void) | null>(null);

// File này bọc Radix AlertDialog và giữ vòng đời overlay/pointer-events dùng chung cho toàn bộ popup trong web.
// Trigger luôn phải được render khi dialog đang đóng; chỉ content của Radix mới được ẩn theo trạng thái open.
function AlertDialog({
    open,
    defaultOpen,
    onOpenChange,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
    const isControlled = open !== undefined;
    const resolvedOpen = isControlled ? open : internalOpen;

    // Đồng bộ một luồng đóng/mở cho cả dialog có state bên ngoài và dialog tự quản lý state.
    const handleOpenChange = React.useCallback(
        (nextOpen: boolean) => {
            if (!isControlled) {
                setInternalOpen(nextOpen);
            }

            if (!nextOpen) {
                // Xóa khóa tương tác ngay khi đóng để điều hướng hoặc unmount không giữ pointer-events trên body.
                document.body.style.removeProperty('pointer-events');
            }

            onOpenChange?.(nextOpen);
        },
        [isControlled, onOpenChange],
    );

    // Overlay dùng callback này để yêu cầu Root đóng mà không phụ thuộc vào vị trí của Content.
    const dismiss = React.useCallback(
        () => handleOpenChange(false),
        [handleOpenChange],
    );

    // Dọn pointer-events inline của body khi Radix khóa tương tác ngoài dialog.
    React.useEffect(() => {
        if (!isControlled || !resolvedOpen) return;

        return () => {
            // Các trang Seller không dùng pointer-events inline cho body; trả về chuỗi rỗng để xóa khóa còn sót.
            document.body.style.removeProperty('pointer-events');
        };
    }, [isControlled, resolvedOpen]);

    // Dialog controlled phải tháo hẳn Portal khi đóng để RemoveScroll giải phóng overlay và quyền tương tác ngay lập tức.
    return (
        <AlertDialogDismissContext.Provider value={dismiss}>
            <AlertDialogPrimitive.Root
                data-slot="alert-dialog"
                open={resolvedOpen}
                onOpenChange={handleOpenChange}
                {...props}
            />
        </AlertDialogDismissContext.Provider>
    );
}

function AlertDialogTrigger(
    props: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>,
) {
    return (
        <AlertDialogPrimitive.Trigger
            data-slot="alert-dialog-trigger"
            {...props}
        />
    );
}

function AlertDialogPortal(
    props: React.ComponentProps<typeof AlertDialogPrimitive.Portal>,
) {
    return (
        <AlertDialogPrimitive.Portal
            data-slot="alert-dialog-portal"
            {...props}
        />
    );
}

function AlertDialogOverlay({
    className,
    onClick,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
    const dismiss = React.useContext(AlertDialogDismissContext);

    // AlertDialog của Radix mặc định chặn outside-click; overlay chủ động phát yêu cầu đóng về Root dùng chung.
    const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
        onClick?.(event);

        if (!event.defaultPrevented) {
            dismiss?.();
        }
    };

    return (
        <AlertDialogPrimitive.Overlay
            data-slot="alert-dialog-overlay"
            className={cn(
                'fixed inset-0 z-50 bg-black/45 backdrop-blur-sm data-[state=closed]:!pointer-events-none data-[state=open]:animate-in data-[state=open]:fade-in-0',
                className,
            )}
            onClick={handleClick}
            {...props}
        />
    );
}

function AlertDialogContent({
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
    return (
        <AlertDialogPortal>
            <AlertDialogOverlay />
            <AlertDialogPrimitive.Content
                data-slot="alert-dialog-content"
                className={cn(
                    'fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl outline-none data-[state=closed]:!pointer-events-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                    className,
                )}
                {...props}
            />
        </AlertDialogPortal>
    );
}

function AlertDialogHeader({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-dialog-header"
            className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
            {...props}
        />
    );
}

function AlertDialogFooter({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-dialog-footer"
            className={cn(
                'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
                className,
            )}
            {...props}
        />
    );
}

function AlertDialogTitle({
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
    return (
        <AlertDialogPrimitive.Title
            data-slot="alert-dialog-title"
            className={cn('text-base font-semibold text-zinc-950', className)}
            {...props}
        />
    );
}

function AlertDialogDescription({
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
    return (
        <AlertDialogPrimitive.Description
            data-slot="alert-dialog-description"
            className={cn('text-sm text-zinc-500', className)}
            {...props}
        />
    );
}

function AlertDialogAction({
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
    return (
        <AlertDialogPrimitive.Action
            data-slot="alert-dialog-action"
            className={cn(buttonVariants(), className)}
            {...props}
        />
    );
}

function AlertDialogCancel({
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
    return (
        <AlertDialogPrimitive.Cancel
            data-slot="alert-dialog-cancel"
            className={cn(buttonVariants({ variant: 'outline' }), className)}
            {...props}
        />
    );
}

export {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    AlertDialogPortal,
    AlertDialogTitle,
    AlertDialogTrigger,
};
