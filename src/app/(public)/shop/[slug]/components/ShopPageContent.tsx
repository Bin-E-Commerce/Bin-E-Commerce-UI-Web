// Component điều phối dữ liệu, điều hướng và các trạng thái hiển thị của public shop.
// UI chi tiết nằm ở các component con; parse/serialize filter nằm ở utils để file này giữ đúng boundary orchestration.

'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ShopCatalog } from './ShopCatalog';
import { ShopClosedState } from './ShopClosedState';
import { ShopHeader } from './ShopHeader';
import { ShopHeaderSkeleton } from './ShopPageSkeleton';
import {
    usePublicShopCatalog,
    usePublicShopProfile,
    usePublicShopSummary,
    useShopFollowMutation,
} from '../hooks/usePublicShop';
import type { ShopCatalogFilters } from '../types/shop-page.types';
import {
    buildShopCatalogHref,
    readShopCatalogFilters,
} from '../utils/shop-filter-url';
import { useAppSelector } from '@/store/hooks';

// Hiển thị trang đóng/suspended theo status Seller, không gọi catalog khi shop không nhận đơn.
export function ShopPageContent({ slug }: { slug: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const initialized = useAppSelector((state) => state.auth.initialized);
    const isAuthenticated = useAppSelector((state) =>
        Boolean(initialized && state.auth.accessToken && state.auth.user?.id),
    );
    const filters = useMemo(
        () => readShopCatalogFilters(searchParams),
        [searchParams],
    );
    const profileQuery = usePublicShopProfile(slug);
    const profile = profileQuery.data;
    const shopType = profile?.shopType ?? 'INTERNAL';
    const isActive = profile?.shop.status === 'active';
    const catalogQuery = usePublicShopCatalog(
        profile?.shop.id,
        filters,
        isActive,
        shopType,
    );
    const summaryQuery = usePublicShopSummary(
        profile?.shop.id,
        isActive,
        shopType,
    );
    const followMutation = useShopFollowMutation(slug);

    // Giữ return URL để guest đăng nhập xong quay lại đúng shop và bộ lọc đang xem.
    function handleFollow() {
        if (!initialized) return;
        if (profile?.shopType === 'EXTERNAL') return;
        if (!isAuthenticated) {
            router.push(
                `/login?redirect=${encodeURIComponent(`${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`)}`,
            );
            return;
        }
        if (profile?.isFollowing) followMutation.unfollow.mutate();
        else followMutation.follow.mutate();
    }

    // Chuyển filter thành URL thay vì setState trong effect, tránh cascading render và hỗ trợ shareable URL.
    function handleFilterChange(patch: Partial<ShopCatalogFilters>) {
        router.replace(buildShopCatalogHref(pathname, filters, patch), {
            scroll: false,
        });
    }

    if (profileQuery.isPending)
        return (
            <main className="bg-zinc-50 px-3 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <ShopHeaderSkeleton />
                </div>
            </main>
        );
    if (profileQuery.isError || !profile)
        return (
            <main className="bg-zinc-50 px-3 py-20 text-center text-zinc-600">
                Không thể tải thông tin shop. Vui lòng thử lại sau.
            </main>
        );

    return (
        <main className="min-h-[70vh] bg-zinc-50 px-3 py-6 sm:px-6 lg:px-8 sm:py-10">
            <div className="mx-auto max-w-7xl">
                <ShopHeader
                    profile={profile}
                    summary={summaryQuery.data}
                    followPending={
                        !initialized ||
                        profile.shopType === 'EXTERNAL' ||
                        followMutation.follow.isPending ||
                        followMutation.unfollow.isPending
                    }
                    onFollow={handleFollow}
                />
                {isActive ? (
                    <ShopCatalog
                        data={
                            catalogQuery.data
                                ? { catalog: catalogQuery.data }
                                : undefined
                        }
                        filters={filters}
                        isLoading={catalogQuery.isPending}
                        isRefreshing={
                            catalogQuery.isFetching && !catalogQuery.isPending
                        }
                        isError={catalogQuery.isError}
                        onRetry={() => catalogQuery.refetch()}
                        onFilterChange={handleFilterChange}
                    />
                ) : (
                    <ShopClosedState
                        status={
                            profile.shop.status === 'closed'
                                ? 'closed'
                                : 'suspended'
                        }
                    />
                )}
            </div>
        </main>
    );
}
