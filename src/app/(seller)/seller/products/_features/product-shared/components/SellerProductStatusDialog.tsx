'use client';

import { ArrowRight, Eye, EyeOff, Power } from 'lucide-react';

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
import type {
    SellerProductPublicationStatus,
    SellerProductStatus,
} from '@/services/product';

export interface SellerProductStatusTarget {
    id: string;
    name: string;
    status: SellerProductStatus;
}

interface SellerProductStatusDialogProps {
    product: SellerProductStatusTarget | null;
    targetStatus: SellerProductPublicationStatus | null;
    loading: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

// Xác nhận chuyển trạng thái bằng visual transition để seller thấy rõ sản phẩm sẽ hiện hay ẩn khỏi storefront.
export function SellerProductStatusDialog({
    product,
    targetStatus,
    loading,
    onOpenChange,
    onConfirm,
}: SellerProductStatusDialogProps) {
    const isActivating = targetStatus === 'ACTIVE';

    return (
        <AlertDialog open={Boolean(product && targetStatus)} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-lg overflow-hidden p-0">
                <div className="bg-zinc-950 px-6 py-5 text-white">
                    <div className="flex items-center gap-3">
                        <span className="flex size-11 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-sm">
                            <Power className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                Trạng thái sản phẩm
                            </p>
                            <p className="mt-1 text-sm font-semibold text-white">
                                {isActivating ? 'Sẵn sàng hiển thị' : 'Tạm ngừng hiển thị'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-5">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {isActivating ? 'Bật bán sản phẩm?' : 'Tắt bán sản phẩm?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="leading-6">
                            Bạn đang thay đổi trạng thái của “{product?.name}”.
                            {isActivating
                                ? ' Sản phẩm sẽ được hiển thị lại trên storefront và khách hàng có thể xem sản phẩm.'
                                : ' Sản phẩm sẽ được ẩn khỏi storefront nhưng vẫn giữ nguyên dữ liệu, ảnh và lịch sử bán hàng.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="mt-5 flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 font-medium text-zinc-600">
                            {product?.status === 'ACTIVE' ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                            {product?.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đang ẩn'}
                        </span>
                        <ArrowRight className="size-4 text-zinc-400" />
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-3 py-1.5 font-semibold text-white">
                            {isActivating ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                            {isActivating ? 'Đang hoạt động' : 'Đang ẩn'}
                        </span>
                    </div>
                </div>
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
                        {isActivating ? 'Bật bán sản phẩm' : 'Tắt bán sản phẩm'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
