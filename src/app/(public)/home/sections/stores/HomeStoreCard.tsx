import Image from 'next/image';
import { Store } from 'lucide-react';

import type { HomeShopSummary } from '../../types/home.types';
import { getShopAvatarUrl } from './utils/get-shop-avatar-url';

interface HomeStoreCardProps {
    shop: HomeShopSummary;
}

// Hiển thị một gian hàng và dùng biểu tượng dự phòng nếu nguồn bên ngoài không có logo hợp lệ.
export function HomeStoreCard({ shop }: HomeStoreCardProps) {
    const avatarUrl = getShopAvatarUrl(shop.avatarUrl);

    return (
        <article className="group flex min-h-56 flex-col items-center justify-center border-b border-r border-zinc-100 p-4 text-center transition-colors hover:bg-zinc-50">
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition-colors group-hover:border-zinc-400">
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt={shop.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                    />
                ) : (
                    <Store className="h-5 w-5" />
                )}
            </div>
            <div className="mt-4 min-w-0">
                <p className="line-clamp-2 text-sm font-semibold">
                    {shop.name}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                    {shop.productCount} sản phẩm nổi bật
                </p>
            </div>
        </article>
    );
}
