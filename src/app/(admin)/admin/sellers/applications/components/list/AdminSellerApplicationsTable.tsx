import Link from 'next/link';
import { Store } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SellerApplicationDto } from '@/services/seller';

import { AdminSellerApplicationStatusBadge } from '../shared/AdminSellerApplicationStatusBadge';
import {
    formatAdminDateTime,
    getApplicationOwnerSummary,
    getApplicationShopDisplayName,
} from '../../utils/seller-application-admin-formatters';

interface AdminSellerApplicationsTableProps {
    items: SellerApplicationDto[];
    loading: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

// Render skeleton dạng hàng bảng để giữ chiều cao ổn định trong lúc tải dữ liệu.
function AdminSellerApplicationsTableSkeleton() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-t border-zinc-100">
                    <td className="px-4 py-4">
                        <div className="h-10 w-52 animate-pulse rounded-lg bg-zinc-100" />
                    </td>
                    <td className="px-4 py-4">
                        <div className="h-9 w-44 animate-pulse rounded-lg bg-zinc-100" />
                    </td>
                    <td className="px-4 py-4">
                        <div className="h-7 w-24 animate-pulse rounded-full bg-zinc-100" />
                    </td>
                    <td className="px-4 py-4">
                        <div className="h-9 w-36 animate-pulse rounded-lg bg-zinc-100" />
                    </td>
                    <td className="px-4 py-4">
                        <div className="h-9 w-32 animate-pulse rounded-lg bg-zinc-100" />
                    </td>
                    <td className="px-4 py-4 text-right">
                        <div className="ml-auto h-8 w-24 animate-pulse rounded-lg bg-zinc-100" />
                    </td>
                </tr>
            ))}
        </>
    );
}

// Bảng danh sách hồ sơ seller, tối ưu để admin scan nhiều hồ sơ trong một màn hình.
export function AdminSellerApplicationsTable({
    items,
    loading,
    page,
    totalPages,
    onPageChange,
}: AdminSellerApplicationsTableProps) {
    return (
        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        <tr>
                            <th className="px-4 py-3">Shop</th>
                            <th className="px-4 py-3">Người bán</th>
                            <th className="px-4 py-3">Trạng thái</th>
                            <th className="px-4 py-3">Liên hệ</th>
                            <th className="px-4 py-3">Thời gian</th>
                            <th className="px-4 py-3 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {loading ? <AdminSellerApplicationsTableSkeleton /> : null}

                        {!loading && items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-14 text-center">
                                    <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-zinc-100">
                                        <Store className="size-5 text-zinc-500" />
                                    </div>
                                    <p className="mt-4 text-sm font-medium text-zinc-950">
                                        Chưa có hồ sơ phù hợp
                                    </p>
                                    <p className="mt-1 text-sm text-zinc-500">
                                        Thử đổi trạng thái hoặc từ khóa tìm kiếm.
                                    </p>
                                </td>
                            </tr>
                        ) : null}

                        {!loading
                            ? items.map((application) => (
                                  <tr
                                      key={application.id}
                                      className="align-top transition-colors hover:bg-zinc-50/80"
                                  >
                                      <td className="px-4 py-4">
                                          <div className="flex items-start gap-3">
                                              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100">
                                                  {application.shop.logoUrl ? (
                                                      <img
                                                          src={application.shop.logoUrl}
                                                          alt="Logo shop"
                                                          className="h-full w-full object-cover"
                                                      />
                                                  ) : (
                                                      <Store className="size-4 text-zinc-500" />
                                                  )}
                                              </div>
                                              <div className="min-w-0">
                                                  <p className="max-w-64 truncate font-semibold text-zinc-950">
                                                      {getApplicationShopDisplayName(application)}
                                                  </p>
                                                  <p className="mt-1 max-w-64 truncate text-xs text-zinc-500">
                                                      {application.shop.slug ?? 'Chưa có đường dẫn shop'}
                                                  </p>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="px-4 py-4">
                                          <p className="max-w-56 truncate font-medium text-zinc-900">
                                              {getApplicationOwnerSummary(application)}
                                          </p>
                                          <p className="mt-1 text-xs text-zinc-500">
                                              {application.seller.profileType === 'business'
                                                  ? 'Doanh nghiệp'
                                                  : 'Cá nhân / Hộ kinh doanh'}
                                          </p>
                                      </td>
                                      <td className="px-4 py-4">
                                          <AdminSellerApplicationStatusBadge
                                              status={application.status}
                                          />
                                      </td>
                                      <td className="px-4 py-4">
                                          <p className="max-w-52 truncate text-zinc-900">
                                              {application.seller.email ?? application.userEmail}
                                          </p>
                                          <p className="mt-1 text-xs text-zinc-500">
                                              {application.seller.phone ?? 'Chưa có số điện thoại'}
                                          </p>
                                      </td>
                                      <td className="px-4 py-4">
                                          <p className="text-zinc-900">
                                              Gửi: {formatAdminDateTime(application.submittedAt)}
                                          </p>
                                          <p className="mt-1 text-xs text-zinc-500">
                                              Cập nhật: {formatAdminDateTime(application.updatedAt)}
                                          </p>
                                      </td>
                                      <td className="px-4 py-4 text-right">
                                          <Link
                                              href={`/admin/sellers/applications/${application.id}`}
                                              className={cn(
                                                  buttonVariants({ variant: 'outline', size: 'sm' }),
                                                  'rounded-lg',
                                              )}
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

            <div className="flex flex-col gap-3 border-t border-zinc-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-zinc-500">
                    Trang {page} / {totalPages}
                </p>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1 || loading}
                    >
                        Trước
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages || loading}
                    >
                        Sau
                    </Button>
                </div>
            </div>
        </section>
    );
}
