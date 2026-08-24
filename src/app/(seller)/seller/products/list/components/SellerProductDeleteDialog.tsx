'use client';

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
import { AlertTriangle, Trash2 } from 'lucide-react';
import type { SellerProductListItem } from '@/services/product';

interface SellerProductDeleteDialogProps {
    product: SellerProductListItem | null;
    loading: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

// Hiển thị xác nhận xóa mềm và nêu rõ giới hạn không thể xóa sản phẩm đang bán hoặc đã phát sinh giao dịch.
export function SellerProductDeleteDialog({
    product,
    loading,
    onOpenChange,
    onConfirm,
}: SellerProductDeleteDialogProps) {
    return (
        <AlertDialog open={Boolean(product)} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3 leading-6">
                            <p>
                                Sản phẩm{' '}
                                <strong className="font-semibold text-zinc-950">
                                    “{product?.name}”
                                </strong>{' '}
                                sẽ được đưa vào trạng thái đã xóa và không còn
                                hiển thị trong shop.
                            </p>
                            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
                                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                                    <Trash2 className="size-4" aria-hidden="true" />
                                    Sau khi xóa sản phẩm
                                </div>
                                <ul className="mt-2 space-y-1.5 pl-5 text-sm text-zinc-600">
                                    <li>
                                        Sản phẩm sẽ <strong className="font-semibold text-zinc-900">không còn hiển thị</strong> trong shop.
                                    </li>
                                    <li>
                                        Ảnh/video media sẽ được <strong className="font-semibold text-zinc-900">giữ nguyên</strong> để có thể khôi phục sản phẩm.
                                    </li>
                                </ul>
                            </div>
                            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
                                <div className="flex items-center gap-2 font-semibold">
                                    <AlertTriangle className="size-4" aria-hidden="true" />
                                    Không thể xóa trong hai trường hợp
                                </div>
                                <p className="mt-1.5">
                                    Sản phẩm đang <strong>hoạt động</strong> hoặc đã <strong>bán</strong> sẽ được giữ lại để bảo vệ dữ liệu và lịch sử giao dịch.
                                </p>
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={loading}
                        onClick={(event) => {
                            event.preventDefault();
                            onConfirm();
                        }}
                        className="bg-red-600 text-white hover:bg-red-700"
                    >
                        {loading ? 'Đang xóa…' : 'Xóa sản phẩm'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
