// Hộp thoại quản trị tri thức; feature truyền nội dung và hành động, còn Dialog dùng chung xử lý focus và bàn phím.

'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { KnowledgeDialogProps } from '../types/shared/dialog.types';

// Hiển thị biểu mẫu trong modal có bề rộng theo loại quy trình và giới hạn chiều cao để phần thân cuộn độc lập.
// Feature tiếp tục điều khiển open để giữ nguyên xác nhận bỏ thay đổi và hành vi đóng; mặc định wide bảo toàn form tài liệu.
export function KnowledgeDialog({
    open,
    width = 'wide',
    title,
    description,
    children,
    footer,
    onOpenChange,
}: KnowledgeDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className={`flex max-h-[calc(100dvh-2rem)] ${width === 'compact' ? 'w-[min(42rem,calc(100vw-2rem))]' : 'w-[min(64rem,calc(100vw-2rem))]'} max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none`}
            >
                <DialogHeader className="relative shrink-0 border-b px-5 py-4 text-left sm:px-6">
                    <DialogTitle className="pr-10 text-lg font-semibold">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="pr-10">
                        {description}
                    </DialogDescription>
                    <DialogClose
                        render={
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Đóng hộp thoại"
                                className="absolute top-3 right-3"
                            />
                        }
                    >
                        <X />
                    </DialogClose>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                    {children}
                </div>
                <div className="w-full shrink-0 border-t bg-background px-4 py-3 sm:px-6">
                    {footer}
                </div>
            </DialogContent>
        </Dialog>
    );
}
