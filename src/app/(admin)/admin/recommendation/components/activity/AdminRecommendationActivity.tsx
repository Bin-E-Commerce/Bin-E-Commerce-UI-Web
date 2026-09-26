// Điều phối danh sách account và hành trình activity; search, lựa chọn và phân trang vẫn do hook cha quản lý.

import type {
    RecommendationAdminActivityItem,
    RecommendationAdminActorsResponse,
} from '@/services/admin';

import { AccountActivityPanel } from './components/AccountActivityPanel';
import { ActiveAccountsPanel } from './components/ActiveAccountsPanel';
import type { ActivityActor } from './types';

interface Props {
    actors: RecommendationAdminActorsResponse['items'];
    selectedUserId: string | null;
    activity: RecommendationAdminActivityItem[];
    loading: boolean;
    activityPage: number;
    activityPageSize: number;
    activityTotal: number;
    search: string;
    onSearchChange: (value: string) => void;
    onActivityPageChange: (page: number) => void;
    onSelect: (userId: string) => void;
}

// Lọc actor thành account thật, tìm account được chọn rồi ghép hai panel mà không sở hữu request/state.
export function AdminRecommendationActivity({
    actors,
    selectedUserId,
    activity,
    loading,
    activityPage,
    activityPageSize,
    activityTotal,
    search,
    onSearchChange,
    onActivityPageChange,
    onSelect,
}: Props) {
    const users: ActivityActor[] = actors.filter(
        (actor) => actor.actorType === 'USER',
    );
    const selectedActor = users.find(
        (actor) => actor.actorId === selectedUserId,
    );

    return (
        <div className="grid min-w-0 gap-4">
            <ActiveAccountsPanel
                users={users}
                selectedUserId={selectedUserId}
                loading={loading}
                search={search}
                onSearchChange={onSearchChange}
                onSelect={onSelect}
            />
            <AccountActivityPanel
                selectedActor={selectedActor}
                selectedUserId={selectedUserId}
                activity={activity}
                loading={loading}
                activityPage={activityPage}
                activityPageSize={activityPageSize}
                activityTotal={activityTotal}
                onActivityPageChange={onActivityPageChange}
            />
        </div>
    );
}
