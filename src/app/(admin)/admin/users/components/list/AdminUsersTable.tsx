// Bảng danh sách user; chỉ nhận dữ liệu đã query và không chứa state filter/pagination.
import Link from 'next/link';
import { ShieldCheck, UserRound } from 'lucide-react';
import type { AdminUserListItem } from '@/services/admin';
import { AdminUserAvatar } from '../shared/AdminUserAvatar';
import { AdminUsersPagination } from './AdminUsersPagination';
import {
    formatAdminUserDate,
    getAdminUserStatusClass,
} from '../../utils/admin-user.utils';

interface AdminUsersTableProps {
    items: AdminUserListItem[];
    isLoading: boolean;
    isFetching: boolean;
    page: number;
    totalPages: number;
    total: number;
    onPrevious: () => void;
    onNext: () => void;
}

// Render loading, empty, row data và pagination theo một flow cố định để bảng không nhảy layout.
export function AdminUsersTable({
    items,
    isLoading,
    isFetching,
    page,
    totalPages,
    total,
    onPrevious,
    onNext,
}: AdminUsersTableProps) {
    return (
        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        <tr>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Trạng thái</th>
                            <th className="px-4 py-3">Last login</th>
                            <th className="px-4 py-3 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-14 text-center text-sm text-zinc-500"
                                >
                                    Đang tải danh sách...
                                </td>
                            </tr>
                        ) : null}
                        {!isLoading && items.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-14 text-center"
                                >
                                    <UserRound className="mx-auto size-7 text-zinc-300" />
                                    <p className="mt-3 font-medium text-zinc-900">
                                        Không có người dùng phù hợp
                                    </p>
                                    <p className="mt-1 text-sm text-zinc-500">
                                        Thử đổi từ khóa hoặc bộ lọc.
                                    </p>
                                </td>
                            </tr>
                        ) : null}
                        {!isLoading
                            ? items.map((user) => (
                                  <tr
                                      key={user.id}
                                      className="hover:bg-zinc-50"
                                  >
                                      <td className="px-4 py-4">
                                          <div className="flex items-center gap-3">
                                              <AdminUserAvatar
                                                  name={user.name}
                                                  avatarUrl={user.avatarUrl}
                                              />
                                              <div>
                                                  <p className="font-semibold text-zinc-950">
                                                      {user.name}
                                                  </p>
                                                  <p className="text-xs text-zinc-500">
                                                      {user.phone ??
                                                          'Chưa có số điện thoại'}
                                                  </p>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="px-4 py-4 text-zinc-700">
                                          {user.email}
                                      </td>
                                      <td className="px-4 py-4">
                                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
                                              <ShieldCheck className="size-3.5" />
                                              {user.role}
                                          </span>
                                      </td>
                                      <td className="px-4 py-4">
                                          <span
                                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getAdminUserStatusClass()}`}
                                          >
                                              {user.status}
                                          </span>
                                      </td>
                                      <td className="px-4 py-4 text-zinc-600">
                                          {formatAdminUserDate(
                                              user.lastLoginAt,
                                              'Chưa đăng nhập',
                                          )}
                                      </td>
                                      <td className="px-4 py-4 text-right">
                                          <Link
                                              href={`/admin/users/${user.id}`}
                                              className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                                          >
                                              Xem chi tiết
                                          </Link>
                                      </td>
                                  </tr>
                              ))
                            : null}
                    </tbody>
                </table>
            </div>
            <AdminUsersPagination
                page={page}
                totalPages={totalPages}
                total={total}
                isFetching={isFetching}
                onPrevious={onPrevious}
                onNext={onNext}
            />
        </section>
    );
}
