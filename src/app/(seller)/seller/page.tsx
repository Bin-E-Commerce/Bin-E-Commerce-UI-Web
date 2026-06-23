import {
    ArrowUpRight,
    Clock3,
    PackageCheck,
    ShoppingCart,
    Star,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button';

// Trang tổng quan seller hiển thị các chỉ số vận hành cần nhìn ngay sau khi đăng nhập.
export default function SellerDashboardPage() {
    return (
        <div className="space-y-6">
            <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
                <div className="grid gap-0 lg:grid-cols-[1.4fr_0.9fr]">
                    <div className="p-6 sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Seller Center
                        </p>
                        <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-zinc-950">
                            Quản trị shop, đơn hàng và doanh thu trong một không gian tập trung.
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                            Theo dõi việc cần xử lý trong ngày, kiểm soát tồn kho và nắm hiệu suất bán hàng
                            mà không phải chuyển qua nhiều màn hình rời rạc.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-2">
                            <Link href="/seller/register" className={buttonVariants()}>
                                Đăng ký bán hàng
                                <ArrowUpRight className="size-4" />
                            </Link>
                            <Button type="button" variant="outline">
                                Xử lý đơn mới
                                <ArrowUpRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="border-t border-zinc-200 bg-zinc-950 p-6 text-white lg:border-l lg:border-t-0 sm:p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">Doanh thu hôm nay</p>
                                <p className="mt-2 text-3xl font-semibold">0 ₫</p>
                            </div>
                            <TrendingUp className="size-8 text-zinc-400" />
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-lg bg-white/10 p-4">
                                <p className="text-zinc-400">Đơn mới</p>
                                <p className="mt-2 text-xl font-semibold">0</p>
                            </div>
                            <div className="rounded-lg bg-white/10 p-4">
                                <p className="text-zinc-400">Cần giao</p>
                                <p className="mt-2 text-xl font-semibold">0</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                    <ShoppingCart className="size-5 text-zinc-500" />
                    <p className="mt-4 text-sm text-zinc-500">Đơn chờ xác nhận</p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-950">0</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                    <PackageCheck className="size-5 text-zinc-500" />
                    <p className="mt-4 text-sm text-zinc-500">Sản phẩm đang bán</p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-950">0</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                    <Wallet className="size-5 text-zinc-500" />
                    <p className="mt-4 text-sm text-zinc-500">Tiền chờ đối soát</p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-950">0 ₫</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                    <Star className="size-5 text-zinc-500" />
                    <p className="mt-4 text-sm text-zinc-500">Đánh giá trung bình</p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-950">--</p>
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-950">Việc cần xử lý</h2>
                            <p className="mt-1 text-sm text-zinc-500">
                                Các đầu việc ảnh hưởng trực tiếp đến trải nghiệm khách hàng.
                            </p>
                        </div>
                        <Clock3 className="size-5 text-zinc-400" />
                    </div>
                    <div className="mt-5 divide-y divide-zinc-100 rounded-lg border border-zinc-100">
                        <div className="flex items-center justify-between p-4">
                            <span className="text-sm font-medium text-zinc-800">Xác nhận đơn mới</span>
                            <span className="text-sm text-zinc-500">0 đơn</span>
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <span className="text-sm font-medium text-zinc-800">Chuẩn bị hàng chờ lấy</span>
                            <span className="text-sm text-zinc-500">0 đơn</span>
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <span className="text-sm font-medium text-zinc-800">Phản hồi đánh giá mới</span>
                            <span className="text-sm text-zinc-500">0 đánh giá</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-zinc-950">Sức khỏe shop</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        Tạm thời chưa có dữ liệu vận hành. Khi shop hoạt động, điểm chất lượng sẽ hiển thị ở đây.
                    </p>
                    <div className="mt-6 h-3 rounded-full bg-zinc-100">
                        <div className="h-full w-0 rounded-full bg-zinc-950" />
                    </div>
                    <p className="mt-3 text-sm text-zinc-500">0/100 điểm</p>
                </div>
            </section>
        </div>
    );
}
