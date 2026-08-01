import {
    CalendarCheck2,
    Copy,
    Mail,
    MapPinned,
    Phone,
    ShoppingBag,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { ShopProfileDto } from '@/services/seller';
import { toast } from 'sonner';
import {
    formatBusinessModel,
    formatShopProfileDate,
} from '../utils/shop-profile-formatters';
import { ShopLogoPreview } from './ShopLogoPreview';
import { ShopProfileDataRow } from './ShopProfileDataRow';

interface ShopBasicInfoPanelProps {
    profile: ShopProfileDto;
    categoryName: string;
}

// Trình bày thông tin công khai theo thứ tự nhận diện, mô tả và liên hệ để seller kiểm tra nhanh trước khi chỉnh sửa.
export function ShopBasicInfoPanel({
    profile,
    categoryName,
}: ShopBasicInfoPanelProps) {
    const { shop } = profile;

    // Sao chép slug giúp seller dùng nhanh trong nội dung quảng bá mà không cần chọn thủ công.
    const copySlug = async () => {
        try {
            await navigator.clipboard.writeText(shop.slug);
            toast.success('Đã sao chép đường dẫn shop.');
        } catch {
            toast.error('Không thể sao chép đường dẫn shop.');
        }
    };

    return (
        <div className="grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
            <section className="border-b border-zinc-200 bg-zinc-50/70 p-5 sm:p-7 lg:border-b-0 lg:border-r">
                <p className="text-xs font-semibold uppercase text-zinc-500">
                    Nhận diện công khai
                </p>
                <ShopLogoPreview
                    src={shop.logoUrl}
                    alt={`Logo ${shop.name}`}
                    className="mt-4 aspect-square w-full max-w-52 rounded-md border border-zinc-200 bg-white shadow-sm"
                />
                <h2 className="mt-5 text-xl font-bold text-zinc-950">
                    {shop.name}
                </h2>
                <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                    <span className="min-w-0 truncate">/{shop.slug}</span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Sao chép đường dẫn shop"
                        title="Sao chép đường dẫn shop"
                        onClick={copySlug}
                    >
                        <Copy className="size-3.5" />
                    </Button>
                </div>
                <div className="mt-5 flex items-center gap-2 border-t border-zinc-200 pt-4 text-xs text-zinc-500">
                    <CalendarCheck2 className="size-4" />
                    Hoạt động từ {formatShopProfileDate(shop.createdAt)}
                </div>
            </section>

            <div className="min-w-0 p-5 sm:p-7">
                <section>
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="size-4 text-zinc-500" />
                        <h2 className="text-base font-semibold text-zinc-950">
                            Thông tin kinh doanh
                        </h2>
                    </div>
                    <dl className="mt-3">
                        <ShopProfileDataRow
                            label="Ngành hàng chính"
                            value={categoryName}
                        />
                        <ShopProfileDataRow
                            label="Mô hình bán hàng"
                            value={formatBusinessModel(shop.businessModel)}
                        />
                        <ShopProfileDataRow
                            label="Mô tả shop"
                            value={shop.description}
                            hint="Nội dung này được hiển thị trên trang công khai của shop."
                        />
                    </dl>
                </section>

                <section className="mt-7 border-t border-zinc-200 pt-6">
                    <div className="flex items-center gap-2">
                        <MapPinned className="size-4 text-zinc-500" />
                        <h2 className="text-base font-semibold text-zinc-950">
                            Kênh liên hệ
                        </h2>
                    </div>
                    <dl className="mt-3">
                        <ShopProfileDataRow
                            label="Email hỗ trợ"
                            value={
                                <span className="inline-flex items-center gap-2">
                                    <Mail className="size-4 text-zinc-400" />
                                    {shop.contactEmail}
                                </span>
                            }
                        />
                        <ShopProfileDataRow
                            label="Số điện thoại"
                            value={
                                <span className="inline-flex items-center gap-2">
                                    <Phone className="size-4 text-zinc-400" />
                                    {shop.contactPhone}
                                </span>
                            }
                        />
                    </dl>
                </section>
            </div>
        </div>
    );
}
