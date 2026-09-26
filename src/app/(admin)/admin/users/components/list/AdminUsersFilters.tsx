// Bộ lọc list user; chỉ phát sự kiện thay đổi lên page hook, không tự gọi API hay điều khiển pagination.
import { Search } from 'lucide-react';
import type { AdminUserRole, AdminUserStatus } from '@/services/admin';
import {
    ADMIN_USER_ROLES,
    ADMIN_USER_STATUSES,
} from '../../constants/admin-user.constants';
import { AdminUserCombobox } from '../shared/AdminUserCombobox';

interface AdminUsersFiltersProps {
    search: string;
    role: AdminUserRole | '';
    status: AdminUserStatus | '';
    onSearchChange: (value: string) => void;
    onRoleChange: (value: AdminUserRole | '') => void;
    onStatusChange: (value: AdminUserStatus | '') => void;
}

// Render search và hai combobox filter; mọi thay đổi đều reset page ở component cha.
export function AdminUsersFilters({
    search,
    role,
    status,
    onSearchChange,
    onRoleChange,
    onStatusChange,
}: AdminUsersFiltersProps) {
    return (
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
                <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                    <input
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Tìm theo tên, email hoặc số điện thoại"
                        className="h-10 w-full rounded-lg border border-zinc-200 pl-9 pr-3 text-sm outline-none focus:border-zinc-500"
                    />
                </label>
                <AdminUserCombobox
                    value={role}
                    ariaLabel="Lọc theo role"
                    placeholder="Tất cả role"
                    options={[
                        { value: '', label: 'Tất cả role' },
                        ...ADMIN_USER_ROLES.map((item) => ({
                            value: item,
                            label: item,
                        })),
                    ]}
                    onValueChange={(value) =>
                        onRoleChange(value as AdminUserRole | '')
                    }
                />
                <AdminUserCombobox
                    value={status}
                    ariaLabel="Lọc theo trạng thái"
                    placeholder="Tất cả trạng thái"
                    options={[
                        { value: '', label: 'Tất cả trạng thái' },
                        ...ADMIN_USER_STATUSES.map((item) => ({
                            value: item,
                            label: item,
                        })),
                    ]}
                    onValueChange={(value) =>
                        onStatusChange(value as AdminUserStatus | '')
                    }
                />
            </div>
        </section>
    );
}
