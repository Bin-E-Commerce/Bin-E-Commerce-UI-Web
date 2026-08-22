import type { CatalogCategory } from '@/services/catalog';
import { getCategoryIcon } from './utils/get-category-icon';

interface CategoryItemProps {
    category: CatalogCategory;
}

// Trình bày ngành hàng bằng một icon có ý nghĩa và dùng tương tác đen-trắng thống nhất với nhận diện chính của website.
export function CategoryItem({ category }: CategoryItemProps) {
    const Icon = getCategoryIcon(category.name);

    return (
        <article className="group flex min-h-32 flex-col items-center justify-center border-b border-r border-zinc-100 px-2 py-4 text-center transition-colors hover:bg-zinc-50">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 transition-colors group-hover:border-zinc-950 group-hover:bg-zinc-950 group-hover:text-white">
                <Icon className="h-5 w-5" />
            </span>
            <p className="line-clamp-2 text-xs font-medium leading-4 text-zinc-700 transition-colors group-hover:text-zinc-950 sm:text-sm">
                {category.name}
            </p>
        </article>
    );
}
