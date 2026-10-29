// Tổng hợp hàng đợi vận hành và điều hướng được cấp quyền; dashboard không lưu nghiệp vụ hay số liệu riêng.
'use client';

import { useSelector } from 'react-redux';
import {
    Banknote,
    ClipboardCheck,
    RefreshCw,
    Store,
    Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RootState } from '@/store';
import { useAdminDashboardOverview } from '../../hooks/useAdminDashboardOverview';
import { AdminDashboardActivityChart } from '../analytics/AdminDashboardActivityChart';
import { AdminDashboardQueueCard } from './AdminDashboardQueueCard';

// Kết hợp số đếm từ hàng đợi thật với menu backend đã lọc quyền để admin biết việc nào cần ưu tiên.
export function AdminDashboardPageClient() {
    const user = useSelector((state: RootState) => state.auth.user);
    const overview = useAdminDashboardOverview(user);

    return (
        <main className="space-y-5 pb-6">
            <section className="relative isolate overflow-hidden rounded-2xl bg-zinc-950 px-5 py-5 text-white shadow-md shadow-zinc-950/10 sm:px-6">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-16 -top-28 size-64 rounded-full border border-white/10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_68%)]"
                />
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
                            Bảng điều khiển vận hành
                        </h1>
                        <p className="mt-1 text-sm text-zinc-300">
                            Xin chào, {user?.name || 'quản trị viên'} · Theo dõi
                            các công việc đang chờ xử lý.
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-1.5">
                        <div className="flex h-11 min-w-32 items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.07] px-3.5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                                Đang chờ
                            </p>
                            <p className="text-xl font-semibold tabular-nums">
                                {overview.pendingTotal ?? '—'}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 rounded-lg border-white/10 bg-white/[0.07] px-4 text-white hover:bg-white/15 hover:text-white"
                            disabled={overview.isRefreshing}
                            onClick={() => void overview.refreshAll()}
                        >
                            <RefreshCw
                                aria-hidden="true"
                                className={
                                    overview.isRefreshing ? 'animate-spin' : ''
                                }
                            />
                            Cập nhật
                        </Button>
                    </div>
                </div>
            </section>

            <section aria-label="Hàng đợi vận hành">
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                    <h2 className="text-base font-semibold text-zinc-950">
                        Hàng đợi cần chú ý
                    </h2>
                    <p className="text-xs text-zinc-500">
                        Số liệu theo quyền truy cập của bạn
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {overview.canReadApplications ? (
                        <AdminDashboardQueueCard
                            href="/admin/sellers/applications"
                            icon={ClipboardCheck}
                            value={overview.applicationsCount}
                            state={overview.applicationsState}
                            title="Hồ sơ seller"
                            description="Đăng ký người bán chờ kiểm tra."
                        />
                    ) : null}
                    {overview.canReadProfileChanges ? (
                        <AdminDashboardQueueCard
                            href="/admin/sellers/profile-changes"
                            icon={Store}
                            value={overview.profileChangesCount}
                            state={overview.profileChangesState}
                            title="Thay đổi hồ sơ shop"
                            description="Thông tin nhạy cảm chờ duyệt."
                        />
                    ) : null}
                    {overview.canReadFinance ? (
                        <AdminDashboardQueueCard
                            href="/admin/finance"
                            icon={Banknote}
                            value={overview.withdrawalsCount}
                            state={overview.withdrawalsState}
                            title="Yêu cầu rút tiền"
                            description="Yêu cầu chờ admin xử lý."
                        />
                    ) : null}
                    {overview.canReadFinance ? (
                        <AdminDashboardQueueCard
                            href="/admin/finance"
                            icon={Truck}
                            value={overview.codRemittancesCount}
                            state={overview.codRemittancesState}
                            title="COD chờ đối soát"
                            description="Đơn hoàn tất chờ xác nhận COD."
                        />
                    ) : null}
                    {!overview.hasVisibleQueues ? (
                        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-5 text-sm text-zinc-500 sm:col-span-2 xl:col-span-4">
                            Các hàng đợi sẽ xuất hiện tại đây khi tài khoản được
                            cấp quyền truy cập nghiệp vụ tương ứng.
                        </div>
                    ) : null}
                </div>
            </section>

            {overview.canReadOperationalActivity ? (
                <AdminDashboardActivityChart
                    overview={overview.activityData}
                    state={overview.activityState}
                    hasPartialError={overview.activityHasPartialError}
                />
            ) : null}
        </main>
    );
}
