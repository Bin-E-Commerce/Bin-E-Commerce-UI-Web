import type { CatalogCategory } from '@/services/catalog';
import { CategoryItem } from './CategoryItem';

interface HomeCategorySectionProps {
    categories: CatalogCategory[];
}

// Hiển thị danh mục thật từ Catalog Service với mật độ phù hợp trên mobile và desktop.
export function HomeCategorySection({
    categories,
}: HomeCategorySectionProps) {
    return (
        <section id="categories" className="mt-3 border-y border-zinc-200 bg-white">
            <div className="mx-auto max-w-7xl">
                <div className="flex min-h-14 items-center justify-between border-b border-zinc-200 px-4 sm:px-6">
                    <div>
                        <p className="text-xs font-semibold uppercase text-zinc-500">
                            Khám phá nhanh
                        </p>
                        <h2 className="text-lg font-bold text-zinc-950">
                            Danh mục ngành hàng
                        </h2>
                    </div>
                    <span className="text-xs text-zinc-400">
                        {categories.length} danh mục
                    </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-10">
                    {categories.map((category) => (
                        <CategoryItem key={category.id} category={category} />
                    ))}
                </div>
            </div>
        </section>
    );
}
