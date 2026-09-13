// Hook này sở hữu query/mutation của Admin Recommendation; component chỉ nhận state và callback đã chuẩn hóa.
// Hook không chứa JSX và không gọi trực tiếp Recommendation Service, mọi HTTP đi qua admin API adapter.

import { useDeferredValue, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
    adminRecommendationService,
    type RecommendationAnalyticsRange,
    type UpdateRecommendationPolicyPayload,
} from '@/services/admin';

import type { RecommendationDateRangeInput } from '../types/date-range.types';

const OVERVIEW_KEY = ['admin-recommendation-overview'];
const ACTORS_KEY = ['admin-recommendation-actors'];
const POLICY_KEY = ['admin-recommendation-policy'];
const ACTIVITY_PAGE_SIZE = 10;

type AdminRecommendationTab = 'overview' | 'activity' | 'policy';

const MAX_ANALYTICS_RANGE_DAYS = 31;

// Chuyển Date sang format input date ổn định theo timezone của trình duyệt; chỉ dùng cho giá trị người dùng chọn.
function toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Tạo preset theo ngày local rồi gửi mốc cuối độc quyền để backend không bỏ sót toàn bộ ngày “Đến ngày”.
function createPresetRange(days: 7 | 30): RecommendationDateRangeInput {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - (days - 1));
    return { from: toDateInputValue(from), to: toDateInputValue(to) };
}

// Đổi input date thành ISO range mà API aggregate dùng với điều kiện occurred_at < to.
function toApiRange(
    input: RecommendationDateRangeInput,
): RecommendationAnalyticsRange {
    const from = new Date(`${input.from}T00:00:00`);
    const toExclusive = new Date(`${input.to}T00:00:00`);
    toExclusive.setDate(toExclusive.getDate() + 1);
    return { from: from.toISOString(), to: toExclusive.toISOString() };
}

// Gom data fetching và mutation theo từng panel để route Admin chỉ compose UI, không phải biết chi tiết cache key/HTTP.
export function useAdminRecommendation() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] =
        useState<AdminRecommendationTab>('overview');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [actorSearch, setActorSearch] = useState('');
    const [activityPage, setActivityPage] = useState(1);
    // Khởi tạo cả input và query bằng cùng một snapshot 7 ngày để dashboard không rơi về mặc định khác của backend.
    const [dateRange, setDateRange] = useState<RecommendationDateRangeInput>(
        () => createPresetRange(7),
    );
    const [appliedDateRange, setAppliedDateRange] =
        useState<RecommendationDateRangeInput | null>(() =>
            createPresetRange(7),
        );
    const [dateRangeError, setDateRangeError] = useState<string | null>(null);
    const analyticsRange = appliedDateRange
        ? toApiRange(appliedDateRange)
        : undefined;
    const deferredActorSearch = useDeferredValue(actorSearch);

    const overviewQuery = useQuery({
        queryKey: [
            ...OVERVIEW_KEY,
            analyticsRange?.from ?? 'default',
            analyticsRange?.to ?? 'default',
        ],
        queryFn: () => adminRecommendationService.getOverview(analyticsRange),
        enabled: activeTab === 'overview',
    });
    const experimentsQuery = useQuery({
        queryKey: [
            'admin-recommendation-experiments',
            analyticsRange?.from ?? 'default',
            analyticsRange?.to ?? 'default',
        ],
        queryFn: () =>
            adminRecommendationService.getExperiments(analyticsRange),
        enabled: activeTab === 'overview',
    });
    const actorsQuery = useQuery({
        queryKey: [
            ...ACTORS_KEY,
            analyticsRange?.from ?? 'default',
            analyticsRange?.to ?? 'default',
            deferredActorSearch,
        ],
        queryFn: () =>
            adminRecommendationService.getActors({
                page: 1,
                pageSize: 25,
                actorType: 'USER',
                from: analyticsRange?.from ?? new Date(0).toISOString(),
                to: analyticsRange?.to ?? new Date().toISOString(),
                search: deferredActorSearch || undefined,
            }),
        enabled: activeTab === 'activity',
    });

    // Derived selection tránh setState trong effect; khi danh sách user vừa tải xong,
    // UI tự chọn user đầu tiên nhưng vẫn tôn trọng lựa chọn thủ công của admin.
    const firstUserId =
        actorsQuery.data?.items.find((actor) => actor.actorType === 'USER')
            ?.actorId ?? null;
    const effectiveSelectedUserId = selectedUserId ?? firstUserId;

    const activityQuery = useQuery({
        queryKey: [
            'admin-recommendation-activity',
            effectiveSelectedUserId,
            analyticsRange?.from,
            analyticsRange?.to,
            activityPage,
        ],
        queryFn: () =>
            adminRecommendationService.getUserActivity(
                effectiveSelectedUserId as string,
                {
                    from: analyticsRange?.from ?? new Date(0).toISOString(),
                    to: analyticsRange?.to ?? new Date().toISOString(),
                    page: activityPage,
                    pageSize: ACTIVITY_PAGE_SIZE,
                },
            ),
        enabled: activeTab === 'activity' && Boolean(effectiveSelectedUserId),
    });
    const policyQuery = useQuery({
        queryKey: POLICY_KEY,
        queryFn: adminRecommendationService.getPolicy,
        enabled: activeTab === 'policy',
    });
    const historyQuery = useQuery({
        queryKey: ['admin-recommendation-policy-history'],
        queryFn: adminRecommendationService.getPolicyHistory,
        enabled: activeTab === 'policy',
    });

    const updatePolicyMutation = useMutation({
        mutationFn: (payload: UpdateRecommendationPolicyPayload) =>
            adminRecommendationService.updatePolicy(payload),
        onSuccess: async () => {
            toast.success('Đã áp dụng policy ranking mới.');
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: POLICY_KEY }),
                queryClient.invalidateQueries({
                    queryKey: ['admin-recommendation-policy-history'],
                }),
            ]);
        },
        onError: () => toast.error('Không thể cập nhật policy ranking.'),
    });

    const rollbackMutation = useMutation({
        mutationFn: (version: string) =>
            adminRecommendationService.rollbackPolicy(version),
        onSuccess: async () => {
            toast.success('Đã rollback policy.');
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: POLICY_KEY }),
                queryClient.invalidateQueries({
                    queryKey: ['admin-recommendation-policy-history'],
                }),
            ]);
        },
        onError: () => toast.error('Không thể rollback policy.'),
    });

    // Làm mới hai nguồn dữ liệu của Overview cùng lúc để nút refresh không tạo trạng thái nửa cũ/nửa mới.
    function refreshOverview() {
        void Promise.all([overviewQuery.refetch(), experimentsQuery.refetch()]);
    }

    // Validate range trước khi đổi query key; giới hạn 31 ngày đồng bộ với backend để lỗi được phản hồi ngay trên UI.
    function applyDateRange() {
        if (!dateRange.from || !dateRange.to) {
            setDateRangeError(
                'Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.',
            );
            return;
        }
        const from = new Date(`${dateRange.from}T00:00:00`);
        const to = new Date(`${dateRange.to}T00:00:00`);
        const days =
            Math.floor((to.getTime() - from.getTime()) / 86_400_000) + 1;
        if (
            Number.isNaN(from.getTime()) ||
            Number.isNaN(to.getTime()) ||
            days <= 0
        ) {
            setDateRangeError('Khoảng ngày không hợp lệ.');
            return;
        }
        if (days > MAX_ANALYTICS_RANGE_DAYS) {
            setDateRangeError('Chỉ được chọn tối đa 31 ngày.');
            return;
        }
        setDateRangeError(null);
        setAppliedDateRange(dateRange);
        setActivityPage(1);
    }

    // Áp dụng nhanh preset và cập nhật cả input để Admin luôn thấy chính xác range đang được query.
    function applyPreset(days: 7 | 30) {
        const preset = createPresetRange(days);
        setDateRange(preset);
        setDateRangeError(null);
        setAppliedDateRange(preset);
        setActivityPage(1);
    }

    // Đưa cả input và query về 7 ngày gần nhất để nút mặc định luôn khớp với phạm vi dashboard đã thống nhất.
    function resetDateRange() {
        const preset = createPresetRange(7);
        setDateRange(preset);
        setDateRangeError(null);
        setAppliedDateRange(preset);
        setActivityPage(1);
    }

    // Đổi account luôn quay về trang đầu để admin không rơi vào trang rỗng khi account mới ít event hơn.
    function selectUser(userId: string) {
        setSelectedUserId(userId);
        setActivityPage(1);
    }

    return {
        activeTab,
        setActiveTab,
        overview: overviewQuery.data ?? null,
        overviewLoading: overviewQuery.isFetching,
        overviewError: overviewQuery.isError,
        experiments: experimentsQuery.data ?? [],
        refreshOverview,
        actors: actorsQuery.data?.items ?? [],
        actorsLoading: actorsQuery.isFetching,
        selectedUserId: effectiveSelectedUserId,
        setSelectedUserId: selectUser,
        actorSearch,
        setActorSearch: (value: string) => {
            setActorSearch(value);
            setSelectedUserId(null);
            setActivityPage(1);
        },
        activity: activityQuery.data?.items ?? [],
        activityPage,
        activityPageSize: ACTIVITY_PAGE_SIZE,
        activityTotal: activityQuery.data?.total ?? 0,
        setActivityPage,
        activityLoading: activityQuery.isFetching,
        policy: policyQuery.data ?? null,
        history: historyQuery.data ?? [],
        policyLoading: policyQuery.isFetching,
        updatePolicy: updatePolicyMutation.mutate,
        policySaving: updatePolicyMutation.isPending,
        rollbackPolicy: rollbackMutation.mutate,
        rollbackSaving: rollbackMutation.isPending,
        dateRange,
        appliedDateRange,
        dateRangeError,
        setDateRange: (value: RecommendationDateRangeInput) => {
            setDateRangeError(null);
            setDateRange(value);
        },
        applyDateRange,
        applyPreset,
        resetDateRange,
    };
}
