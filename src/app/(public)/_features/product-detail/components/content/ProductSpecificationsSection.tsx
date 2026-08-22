import { ClipboardList } from 'lucide-react';

import type { ProductDetail } from '@/services/product';
import { getProductSpecifications } from '../../utils/product-detail-presentation';

interface ProductSpecificationsSectionProps {
    product: ProductDetail;
}

// Trình bày thông số sản phẩm đã map từ nguồn dữ liệu, chỉ giữ các trường người mua cần xem.
export function ProductSpecificationsSection({
    product,
}: ProductSpecificationsSectionProps) {
    const specifications = getProductSpecifications(product);
    const rows = [
        ...(product.brand?.name
            ? [{ id: 'brand', label: 'Thương hiệu', value: product.brand.name }]
            : []),
        { id: 'origin', label: 'Nguồn dữ liệu', value: product.sourcePlatform?.toUpperCase() ?? 'Bin E-Commerce' },
        ...specifications,
    ];

    return (
        <section className="border border-zinc-200 bg-white">
            <div className="flex items-center gap-3 border-b border-zinc-200 px-5 py-4 sm:px-7">
                <span className="flex h-9 w-9 items-center justify-center rounded bg-zinc-950 text-white">
                    <ClipboardList className="h-4 w-4" />
                </span>
                <div>
                    <p className="text-xs font-semibold uppercase text-zinc-500">
                        Thông tin kỹ thuật
                    </p>
                    <h2 className="text-lg font-bold text-zinc-950">
                        Chi tiết sản phẩm
                    </h2>
                </div>
            </div>
            <dl className="divide-y divide-zinc-100 px-5 py-2 sm:px-7">
                {rows.map((row) => (
                    <div key={row.id} className="grid gap-1 py-3 sm:grid-cols-[180px_1fr] sm:gap-5">
                        <dt className="text-sm text-zinc-500">{row.label}</dt>
                        <dd className="break-words text-sm font-medium text-zinc-900">
                            {row.value}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
