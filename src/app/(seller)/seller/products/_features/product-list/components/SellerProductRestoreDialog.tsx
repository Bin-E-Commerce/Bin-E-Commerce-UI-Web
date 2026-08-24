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
import { ArchiveRestore, CheckCircle2 } from 'lucide-react';
import type { SellerProductListItem } from '@/services/product';

interface SellerProductRestoreDialogProps {
    product: SellerProductListItem | null;
    loading: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

// Xác nhận khôi phục và giải thích rõ sản phẩm chỉ trở về trạng thái ẩn, không tự động hiển thị lại cho khách.
export function SellerProductRestoreDialog({
    product,
    loading,
    onOpenChange,
    onConfirm,
}: SellerProductRestoreDialogProps) {
    return (
        <AlertDialog open={Boolean(product)} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md overflow-hidden p-0">
                <AlertDialogHeader className="border-b border-zinc-200 bg-zinc-50 px-6 py-5">
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                            <ArchiveRestore className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                Vòng đời sản phẩm
                            </p>
                            <AlertDialogTitle className="mt-1 text-lg text-zinc-950">
                                Khôi phục sản phẩm?
                            </AlertDialogTitle>
                        </div>
                    </div>
                </AlertDialogHeader>
                <AlertDialogDescription asChild>
                    <div className="space-y-4 px-6 py-5 text-sm leading-6 text-zinc-600">
                        <p>
                            Sản phẩm{' '}
                            <strong className="font-semibold text-zinc-950">
                                “{product?.name}”
                            </strong>{' '}
                            sẽ được đưa ra khỏi danh sách đã xóa mềm.
                        </p>
                        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                                <CheckCircle2 className="size-4" aria-hidden="true" />
                                Sau khi khôi phục
                            </div>
                            <ul className="mt-2 space-y-1.5 pl-6 text-sm text-zinc-600">
                                <li>Sản phẩm trở về trạng thái <strong className="font-semibold text-zinc-950">Đang ẩn</strong>.</li>
                                <li>Ảnh, video và dữ liệu phân loại được giữ nguyên.</li>
                                <li>Sản phẩm chưa hiển thị cho khách cho đến khi bạn bật bán.</li>
                            </ul>
                        </div>
                    </div>
                </AlertDialogDescription>
                <AlertDialogFooter className="border-t border-zinc-200 bg-zinc-50 px-6 py-4">
                    <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={loading}
                        onClick={(event) => {
                            event.preventDefault();
                            onConfirm();
                        }}
                        className="bg-zinc-950 text-white hover:bg-zinc-800"
                    >
                        {loading ? 'Đang khôi phục…' : 'Khôi phục sản phẩm'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
