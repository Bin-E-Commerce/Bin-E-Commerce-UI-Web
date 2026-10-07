// Primitive UI của insight sản phẩm: chuẩn hoá dữ liệu và bảo vệ link/ảnh trước dữ liệu thiếu.
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ImageOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

// Format số theo locale seller và dùng em dash khi backend không có giá trị số.
export function formatInsightNumber(value: unknown): string {
    return typeof value === 'number'
        ? new Intl.NumberFormat('vi-VN').format(value)
        : '—';
}

// Chỉ nhận text từ payload whitelist để UI không render object hoặc chuỗi rỗng.
export function formatInsightText(value: unknown): string {
    return typeof value === 'string' && value.trim()
        ? value
        : 'Sản phẩm chưa có tên';
}

// Chỉ tạo URL từ productId đã được backend scope theo shop hiện tại.
function buildSellerProductHref(value: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) return null;
    return `/seller/products/${encodeURIComponent(value.trim())}`;
}

// Dùng chung khung link cho insight sản phẩm, fallback thành div khi không có productId.
export function SellerProductInsightShell({
    productId,
    children,
}: {
    productId: unknown;
    children: ReactNode;
}) {
    const href = buildSellerProductHref(productId);
    const className =
        'group flex min-w-0 items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 transition-colors hover:border-zinc-300 hover:bg-zinc-100';

    return href ? (
        <Link href={href} className={className}>
            {children}
        </Link>
    ) : (
        <div className={className}>{children}</div>
    );
}

// Render thumbnail cố định kích thước để ảnh lỗi hoặc thiếu không làm vỡ layout card.
export function SellerProductThumbnail({
    name,
    thumbnailUrl,
}: {
    name: string;
    thumbnailUrl: unknown;
}) {
    const imageUrl =
        typeof thumbnailUrl === 'string' && thumbnailUrl.trim()
            ? thumbnailUrl
            : null;
    const [imageFailed, setImageFailed] = useState(false);
    const canShowImage = imageUrl !== null && !imageFailed;

    return (
        <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-white text-zinc-400">
            {canShowImage ? (
                <Image
                    src={imageUrl ?? ''}
                    alt={name}
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                    onError={() => setImageFailed(true)}
                />
            ) : (
                <ImageOff className="size-4" />
            )}
        </span>
    );
}

// Icon điều hướng dùng chung cho card có thể mở chi tiết sản phẩm.
export function SellerProductInsightArrow() {
    return (
        <ArrowUpRight className="size-4 shrink-0 text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    );
}
