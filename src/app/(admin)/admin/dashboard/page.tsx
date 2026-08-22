import Link from 'next/link';
import { ArrowRight, ClipboardCheck, ShieldCheck, Store, UsersRound } from 'lucide-react';

// Dashboard admin ưu tiên lối vào các nghiệp vụ cần xử lý trước, chưa hiển thị biểu đồ khi chưa có dữ liệu thật.
export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                    Admin Center
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-zinc-950">
                    Bảng điều khiển vận hành
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                    Theo dõi các hàng chờ quan trọng, duyệt hồ sơ người bán và điều phối
                    các module vận hành của sàn Bin E-Commerce.
                </p>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Link
                    href="/admin/sellers/applications"
                    className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                >
                    <div className="flex items-start justify-between gap-4">
                        <span className="flex size-10 items-center justify-center rounded-lg bg-zinc-950 text-white">
                            <ClipboardCheck className="size-5" />
                        </span>
                        <ArrowRight className="size-4 text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-zinc-700" />
                    </div>
                    <h2 className="mt-4 text-base font-semibold text-zinc-950">
                        Hồ sơ seller
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                        Duyệt người bán mới, kiểm tra định danh và trạng thái shop.
                    </p>
                </Link>

                <Link
                    href="/admin/sellers"
                    className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                >
                    <div className="flex items-start justify-between gap-4">
                        <span className="flex size-10 items-center justify-center rounded-lg bg-zinc-950 text-white">
                            <Store className="size-5" />
                        </span>
                        <ArrowRight className="size-4 text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-zinc-700" />
                    </div>
                    <h2 className="mt-4 text-base font-semibold text-zinc-950">
                        Tài khoản seller
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                        Theo dõi shop đang hoạt động, cảnh báo và vi phạm.
                    </p>
                </Link>

                <Link
                    href="/admin/users"
                    className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                >
                    <div className="flex items-start justify-between gap-4">
                        <span className="flex size-10 items-center justify-center rounded-lg bg-zinc-950 text-white">
                            <UsersRound className="size-5" />
                        </span>
                        <ArrowRight className="size-4 text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-zinc-700" />
                    </div>
                    <h2 className="mt-4 text-base font-semibold text-zinc-950">
                        Người dùng
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                        Quản lý khách hàng, nhân sự và quyền truy cập.
                    </p>
                </Link>

                <Link
                    href="/admin/security"
                    className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                >
                    <div className="flex items-start justify-between gap-4">
                        <span className="flex size-10 items-center justify-center rounded-lg bg-zinc-950 text-white">
                            <ShieldCheck className="size-5" />
                        </span>
                        <ArrowRight className="size-4 text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-zinc-700" />
                    </div>
                    <h2 className="mt-4 text-base font-semibold text-zinc-950">
                        An toàn nền tảng
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                        Theo dõi rủi ro vận hành và kiểm soát bảo mật.
                    </p>
                </Link>
            </section>
        </div>
    );
}
