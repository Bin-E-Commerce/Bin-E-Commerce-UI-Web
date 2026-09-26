// Client shell của Recommendation Center; chỉ compose các panel domain và giao state từ hook.
// File không sở hữu HTTP request, permission hoặc business rule của ranking.

'use client';

import { BarChart3, ListFilter, Settings2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useAdminRecommendation } from '../hooks/useAdminRecommendation';
import { AdminRecommendationActivity } from './activity/AdminRecommendationActivity';
import { AdminRecommendationDateRange } from './filters/AdminRecommendationDateRange';
import { AdminRecommendationOverview } from './overview/AdminRecommendationOverview';
import { AdminRecommendationPolicy } from './policy/AdminRecommendationPolicy';

const tabs = [
    { key: 'overview', label: 'Tổng quan', icon: BarChart3 },
    { key: 'activity', label: 'Theo tài khoản', icon: ListFilter },
    { key: 'policy', label: 'Policy ranking', icon: Settings2 },
] as const;

// Render shell chung của Admin Recommendation Center; panel nào active mới được mount để tránh gọi/hiển thị thừa.
export function AdminRecommendationPageClient() {
    const state = useAdminRecommendation();

    return (
        <div className="space-y-6">
            <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-950">
                            Phân tích và điều khiển gợi ý
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
                            Theo dõi hành vi recommendation và điều chỉnh policy
                            có version.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="default"
                        onClick={state.refreshOverview}
                    >
                        Làm mới dữ liệu
                    </Button>
                </div>

                <AdminRecommendationDateRange
                    value={state.dateRange}
                    appliedValue={state.appliedDateRange}
                    error={state.dateRangeError}
                    loading={state.overviewLoading}
                    onChange={state.setDateRange}
                    onApply={state.applyDateRange}
                    onPreset={state.applyPreset}
                    onReset={state.resetDateRange}
                />

                <div
                    role="tablist"
                    aria-label="Các khu vực Recommendation Center"
                    className="mt-6 grid w-full grid-cols-1 gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 sm:grid-cols-3"
                >
                    {tabs.map(({ key, label, icon: Icon }) => {
                        const isActive = state.activeTab === key;

                        return (
                            <Button
                                variant="ghost"
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => state.setActiveTab(key)}
                                className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 sm:px-4 ${
                                    isActive
                                        ? 'bg-zinc-950 text-white shadow-sm'
                                        : 'text-zinc-600 hover:bg-white hover:text-zinc-950 hover:shadow-sm'
                                }`}
                            >
                                <span
                                    className={`flex size-6 items-center justify-center rounded-md ${isActive ? 'bg-white/10' : 'bg-white text-zinc-500'}`}
                                >
                                    <Icon className="size-3.5" />
                                </span>
                                {label}
                            </Button>
                        );
                    })}
                </div>
            </section>

            {state.activeTab === 'overview' ? (
                <AdminRecommendationOverview
                    overview={state.overview}
                    rankingPerformance={state.rankingPerformance}
                    loading={state.overviewLoading}
                />
            ) : null}

            {state.activeTab === 'activity' ? (
                <AdminRecommendationActivity
                    actors={state.actors}
                    selectedUserId={state.selectedUserId}
                    activity={state.activity}
                    loading={state.activityLoading || state.actorsLoading}
                    activityPage={state.activityPage}
                    activityPageSize={state.activityPageSize}
                    activityTotal={state.activityTotal}
                    search={state.actorSearch}
                    onSearchChange={state.setActorSearch}
                    onActivityPageChange={state.setActivityPage}
                    onSelect={state.setSelectedUserId}
                />
            ) : null}

            {state.activeTab === 'policy' ? (
                <AdminRecommendationPolicy
                    key={state.policy?.version ?? 'policy-loading'}
                    policy={state.policy}
                    history={state.history}
                    loading={state.policyLoading}
                    saving={state.policySaving}
                    rollbackSaving={state.rollbackSaving}
                    onSave={state.updatePolicy}
                    onRollback={state.rollbackPolicy}
                />
            ) : null}

            {state.overviewError && state.activeTab === 'overview' ? (
                <p className="text-sm text-red-600">
                    Không tải được dữ liệu recommendation. Kiểm tra permission
                    và Recommendation Service.
                </p>
            ) : null}
        </div>
    );
}
