import {
    BadgePercent,
    CircleDollarSign,
    LayoutGrid,
    PackageCheck,
    ShieldCheck,
    Store,
} from 'lucide-react';

import { ShortcutItem } from './ShortcutItem';

// Cung cấp các lối tắt phổ biến ngay dưới banner để người dùng đến nhanh khu vực cần xem.
export function HomeShortcutSection() {
    return (
        <section className="border-y border-zinc-200 bg-white">
            <div className="mx-auto grid max-w-7xl grid-cols-3 sm:grid-cols-6">
                <ShortcutItem
                    icon={<BadgePercent />}
                    label="Giá tốt hôm nay"
                    href="#products"
                />
                <ShortcutItem
                    icon={<Store />}
                    label="Gian hàng nổi bật"
                    href="#stores"
                />
                <ShortcutItem
                    icon={<PackageCheck />}
                    label="Sản phẩm mới"
                    href="#recommendations"
                />
                <ShortcutItem
                    icon={<ShieldCheck />}
                    label="Mua sắm an tâm"
                    href="#products"
                />
                <ShortcutItem
                    icon={<CircleDollarSign />}
                    label="Giá minh bạch"
                    href="#products"
                />
                <ShortcutItem
                    icon={<LayoutGrid />}
                    label="Danh mục đa dạng"
                    href="#categories"
                />
            </div>
        </section>
    );
}
