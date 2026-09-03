// File này gom các thao tác sản phẩm và mở nhanh đúng khu vực tồn kho khi seller cần nhập hàng.
'use client';

import Link from 'next/link';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
    ArchiveRestore,
    Eye,
    MoreHorizontal,
    PackageCheck,
    Pencil,
    Power,
    Trash2,
} from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
    SellerProductListItem,
    SellerProductPublicationStatus,
} from '@/services/product';
import { useSessionPermission } from '@/hooks/auth/use-session-access';
import { getNextSellerProductStatus } from '../utils/seller-product-status';

interface SellerProductActionsMenuProps {
    product: SellerProductListItem;
    onDelete: (product: SellerProductListItem) => void;
    onRestore: (product: SellerProductListItem) => void;
    onChangeStatus: (
        product: SellerProductListItem,
        status: SellerProductPublicationStatus,
    ) => void;
}

// Gom các thao tác của một product vào menu nổi để bảng giữ một cột hành động gọn và không gây rối mắt.
export function SellerProductActionsMenu({
    product,
    onDelete,
    onRestore,
    onChangeStatus,
}: SellerProductActionsMenuProps) {
    const canUpdate = useSessionPermission('seller.product.update');
    const canChangeStatus = useSessionPermission(
        'seller.product.status.update',
    );
    const canDelete = useSessionPermission('seller.product.delete');
    const canRestore = useSessionPermission('seller.product.restore');

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    type="button"
                    aria-label={`Mở thao tác cho ${product.name}`}
                    title="Mở thao tác"
                    className={cn(
                        buttonVariants({ variant: 'outline', size: 'icon' }),
                        'size-9 rounded-lg border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all hover:border-zinc-950 hover:bg-zinc-950 hover:text-white data-[state=open]:border-zinc-950 data-[state=open]:bg-zinc-950 data-[state=open]:text-white',
                    )}
                >
                    <MoreHorizontal className="size-4" aria-hidden="true" />
                </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 min-w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl shadow-zinc-950/10"
                >
                    <DropdownMenu.Label className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                        Thao tác sản phẩm
                    </DropdownMenu.Label>
                    {product.status === 'DELETED' ? (
                        canRestore ? (
                            <DropdownMenu.Item
                                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-800 outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100"
                                onSelect={() => onRestore(product)}
                            >
                                <ArchiveRestore
                                    className="size-4 text-zinc-600"
                                    aria-hidden="true"
                                />
                                Khôi phục sản phẩm
                            </DropdownMenu.Item>
                        ) : null
                    ) : (
                        <>
                            <DropdownMenu.Item asChild>
                                <Link
                                    href={`/seller/products/${product.id}`}
                                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100"
                                >
                                    <Eye
                                        className="size-4 text-zinc-500"
                                        aria-hidden="true"
                                    />
                                    Xem chi tiết
                                </Link>
                            </DropdownMenu.Item>
                            {canUpdate ? (
                                <DropdownMenu.Item asChild>
                                    <Link
                                        href={`/seller/products/${product.id}/edit?step=sales`}
                                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100"
                                    >
                                        <PackageCheck
                                            className="size-4 text-zinc-500"
                                            aria-hidden="true"
                                        />
                                        Cập nhật tồn kho
                                    </Link>
                                </DropdownMenu.Item>
                            ) : null}
                            {canUpdate ? (
                                <DropdownMenu.Item asChild>
                                    <Link
                                        href={`/seller/products/${product.id}/edit`}
                                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100"
                                    >
                                        <Pencil
                                            className="size-4 text-zinc-500"
                                            aria-hidden="true"
                                        />
                                        Chỉnh sửa sản phẩm
                                    </Link>
                                </DropdownMenu.Item>
                            ) : null}
                            {canChangeStatus ? (
                                <DropdownMenu.Item
                                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100"
                                    onSelect={() =>
                                        onChangeStatus(
                                            product,
                                            getNextSellerProductStatus(
                                                product.status,
                                            ),
                                        )
                                    }
                                >
                                    <Power
                                        className={cn(
                                            'size-4',
                                            product.status === 'ACTIVE'
                                                ? 'text-zinc-600'
                                                : 'text-zinc-600',
                                        )}
                                        aria-hidden="true"
                                    />
                                    {product.status === 'ACTIVE'
                                        ? 'Tắt bán sản phẩm'
                                        : 'Đăng bán sản phẩm'}
                                </DropdownMenu.Item>
                            ) : null}
                            {canDelete ? (
                                <>
                                    <DropdownMenu.Separator className="my-1 h-px bg-zinc-100" />
                                    <DropdownMenu.Item
                                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 outline-none transition-colors hover:bg-red-50 focus:bg-red-50"
                                        onSelect={() => onDelete(product)}
                                    >
                                        <Trash2
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                        Xóa sản phẩm
                                    </DropdownMenu.Item>
                                </>
                            ) : null}
                        </>
                    )}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}
