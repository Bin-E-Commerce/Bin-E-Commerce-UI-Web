import type { PublicProduct } from '@/services/product';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/app/(public)/products/components/ProductCard';

interface HomeProductSectionProps {
    id?: string;
    eyebrow: string;
    title: string;
    description: string;
    products: PublicProduct[];
    mode: 'rail' | 'grid';
    ranked?: boolean;
}

// Dùng chung bố cục danh sách sản phẩm để các section nhất quán mà không nhân đôi markup.
export function HomeProductSection({
    id,
    eyebrow,
    title,
    description,
    products,
    mode,
    ranked = false,
}: HomeProductSectionProps) {
    if (products.length === 0) return null;

    return (
        <section
            id={id}
            className="mt-3 border-y border-zinc-200 bg-white"
        >
            <div className="mx-auto max-w-7xl">
                <div className="flex min-h-20 flex-col justify-center gap-1 border-b border-zinc-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <p className="text-xs font-semibold uppercase text-red-600">
                            {eyebrow}
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-zinc-950">
                            {title}
                        </h2>
                    </div>
                    <p className="max-w-xl text-xs leading-5 text-zinc-500 sm:text-right sm:text-sm">
                        {description}
                    </p>
                </div>

                <div
                    className={cn(
                        mode === 'rail'
                            ? 'flex snap-x gap-2 overflow-x-auto p-3 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6 lg:p-4'
                            : 'grid grid-cols-2 gap-2 p-2 sm:grid-cols-3 sm:p-4 lg:grid-cols-4 xl:grid-cols-6',
                    )}
                >
                    {products.map((product, index) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            compact={mode === 'rail'}
                            rank={ranked ? index + 1 : undefined}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
