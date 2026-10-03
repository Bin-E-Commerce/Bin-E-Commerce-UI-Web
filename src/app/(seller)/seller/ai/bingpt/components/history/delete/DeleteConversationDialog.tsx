// File này hiển thị xác nhận xóa conversation của Seller Copilot.
// Component chỉ quản lý presentation và trạng thái loading từ bên ngoài; mutation, rollback và ownership vẫn thuộc hook.
'use client';

import { Trash2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteConversationDialogProps {
    open: boolean;
    loading: boolean;
    conversationTitle: string;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

// Xác nhận thao tác xóa vĩnh viễn và khóa dialog trong lúc request để tránh gửi lặp command.
export function DeleteConversationDialog({
    open,
    loading,
    conversationTitle,
    onOpenChange,
    onConfirm,
}: DeleteConversationDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-sm">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                            <Trash2 className="h-5 w-5 text-red-600" />
                        </div>
                        <AlertDialogTitle>Xóa đoạn chat này?</AlertDialogTitle>
                    </div>
                    <div className="rounded-xl bg-zinc-50 px-3 py-2 text-left">
                        <AlertDialogDescription className="min-w-0 break-words">
                            Đoạn chat <strong>“{conversationTitle}”</strong> và
                            toàn bộ tin nhắn bên trong sẽ bị xóa vĩnh viễn.
                        </AlertDialogDescription>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                    <AlertDialogCancel disabled={loading} className="mt-0">
                        Hủy
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructiveSolid"
                        disabled={loading}
                        onClick={(event) => {
                            event.preventDefault();
                            onConfirm();
                        }}
                    >
                        {loading ? 'Đang xóa...' : 'Xóa đoạn chat'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
