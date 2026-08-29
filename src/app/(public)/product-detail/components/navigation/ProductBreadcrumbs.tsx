import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

import type { ProductBreadcrumbItem } from '../../types/product-detail.types';

interface ProductBreadcrumbsProps {
    items: ProductBreadcrumbItem[];
    productName: string;
}

// Tạo đường dẫn ngữ cảnh từ metadata category và rút gọn tên sản phẩm ở điểm cuối.
export function ProductBreadcrumbs({
    items,
    productName,
}: ProductBreadcrumbsProps) {
    return (
        <nav aria-label="Đường dẫn sản phẩm" className="overflow-hidden">
            <ol className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-xs text-zinc-500">
                <li>
                    <Link
                        href="/"
                        aria-label="Trang chủ"
                        className="inline-flex items-center hover:text-red-600"
                    >
                        <Home className="h-3.5 w-3.5" />
                    </Link>
                </li>
                {items.map((item) => (
                    <li key={`${item.slug ?? item.name}-${item.name}`} className="flex items-center gap-1.5">
                        <ChevronRight className="h-3 w-3 shrink-0 text-zinc-300" />
                        <span className="max-w-40 truncate">{item.name}</span>
                    </li>
                ))}
                <li className="flex min-w-0 items-center gap-1.5">
                    <ChevronRight className="h-3 w-3 shrink-0 text-zinc-300" />
                    <span className="truncate font-medium text-zinc-800">
                        {productName}
                    </span>
                </li>
            </ol>
        </nav>
    );
}
