import { Store } from 'lucide-react';

import type { HomeShopSummary } from '../../types/home.types';
import { HomeStoreCard } from './HomeStoreCard';

interface HomeStoreSectionProps {
    shops: HomeShopSummary[];
}

// Giới thiệu các gian hàng có nhiều sản phẩm trong tập dữ liệu hiện tại mà không tạo seller nội bộ giả.
export function HomeStoreSection({ shops }: HomeStoreSectionProps) {
    return (
        <section id="stores" className="mt-3 border-y border-zinc-200 bg-white">
            <div className="mx-auto max-w-7xl">
                <div className="flex min-h-16 items-center gap-3 border-b border-zinc-200 px-4 sm:px-6">
                    <p className="text-lg font-bold text-red-600">Bin Mall</p>
                    <span className="hidden h-5 w-px bg-zinc-200 sm:block" />
                    <p className="text-xs text-zinc-500 sm:text-sm">
                        Khám phá gian hàng và nguồn bán rõ ràng
                    </p>
                </div>

                <div className="grid lg:grid-cols-[1.1fr_3fr]">
                    <div className="flex min-h-56 flex-col justify-between bg-zinc-950 p-6 text-white sm:p-8">
                        <div>
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-red-600">
                                <Store className="h-5 w-5" />
                            </span>
                            <h2 className="mt-5 max-w-xs text-2xl font-bold leading-tight">
                                Gian hàng nổi bật trên Bin E-Commerce
                            </h2>
                        </div>
                        <p className="mt-6 max-w-sm text-sm leading-6 text-zinc-400">
                            Nhận diện nhà bán ngay trên từng sản phẩm để lựa chọn dễ dàng hơn.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                        {shops.map((shop) => (
                            <HomeStoreCard key={shop.id} shop={shop} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
