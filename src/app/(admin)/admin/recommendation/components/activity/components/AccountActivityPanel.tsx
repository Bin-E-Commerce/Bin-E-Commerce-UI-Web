// Khung hành trình của một account, ghép header, trạng thái dữ liệu, bảng event và phân trang.

import { CalendarDays, UserRound } from 'lucide-react';

import type { ActivityActor, ActivityItem } from '../types';
import { AccountActivityHeader } from './AccountActivityHeader';
import { ActivityEventTable } from './ActivityEventTable';
import { ActivityPagination } from './ActivityPagination';

interface Props {
    selectedActor: ActivityActor | undefined;
    selectedUserId: string | null;
    activity: ActivityItem[];
    loading: boolean;
    activityPage: number;
    activityPageSize: number;
    activityTotal: number;
    onActivityPageChange: (page: number) => void;
}

// Giữ header account luôn hiện, sau đó chỉ render đúng trạng thái loading, empty hoặc dữ liệu.
export function AccountActivityPanel({
    selectedActor,
    selectedUserId,
    activity,
    loading,
    activityPage,
    activityPageSize,
    activityTotal,
    onActivityPageChange,
}: Props) {
    return (
        <section className="min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <AccountActivityHeader
                selectedActor={selectedActor}
                selectedUserId={selectedUserId}
            />

            {loading ? (
                <p className="p-6 text-sm text-zinc-500">
                    Đang tải hành trình recommendation...
                </p>
            ) : null}

            {!loading && !selectedUserId ? (
                <div className="px-6 py-14 text-center">
                    <UserRound className="mx-auto size-7 text-zinc-300" />
                    <p className="mt-3 text-sm font-medium text-zinc-600">
                        Chưa chọn tài khoản
                    </p>
                </div>
            ) : null}

            {!loading && selectedUserId && activity.length === 0 ? (
                <div className="px-6 py-14 text-center">
                    <CalendarDays className="mx-auto size-7 text-zinc-300" />
                    <p className="mt-3 text-sm font-medium text-zinc-600">
                        Chưa có activity trong khoảng thời gian này
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                        Thử mở rộng khoảng ngày để xem thêm dữ liệu.
                    </p>
                </div>
            ) : null}

            {!loading && activity.length > 0 ? (
                <>
                    <ActivityEventTable activity={activity} />
                    {activityTotal > 0 ? (
                        <ActivityPagination
                            page={activityPage}
                            pageSize={activityPageSize}
                            total={activityTotal}
                            onPageChange={onActivityPageChange}
                        />
                    ) : null}
                </>
            ) : null}
        </section>
    );
}
