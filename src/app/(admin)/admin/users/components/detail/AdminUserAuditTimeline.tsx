// Timeline audit của user detail; chỉ trình bày before/after và sync status từ API.
import { CircleAlert, CircleCheck, Clock3, UserRound } from 'lucide-react';
import type { AdminUserAudit } from '@/services/admin';
import {
    formatAdminUserDate,
    getAdminAuditActionLabel,
    getAdminAuditStatusClass,
    renderAdminAuditJson,
} from '../../utils/admin-user.utils';

interface AdminUserAuditTimelineProps {
    entries: AdminUserAudit[];
}

// Render timeline theo thứ tự API trả về; không tự sắp xếp để giữ contract phân trang của backend.
export function AdminUserAuditTimeline({
    entries,
}: AdminUserAuditTimelineProps) {
    return (
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
                <UserRound className="size-5 text-zinc-500" />
                <div>
                    <h2 className="font-semibold text-zinc-950">
                        Audit timeline
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        Lịch sử thao tác quản trị gần nhất, gồm before/after và
                        trạng thái đồng bộ.
                    </p>
                </div>
            </div>
            <div className="mt-5 space-y-3">
                {entries.length ? (
                    entries.map((entry) => (
                        <article
                            key={entry.id}
                            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm">
                                        {entry.syncStatus === 'SUCCESS' ? (
                                            <CircleCheck className="size-4" />
                                        ) : entry.syncStatus === 'FAILED' ? (
                                            <CircleAlert className="size-4" />
                                        ) : (
                                            <Clock3 className="size-4" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                                            Thao tác quản trị
                                        </p>
                                        <h3 className="mt-1 font-semibold text-zinc-950">
                                            {getAdminAuditActionLabel(
                                                entry.action,
                                            )}
                                        </h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:pl-3">
                                    <span
                                        className={getAdminAuditStatusClass(
                                            entry.syncStatus,
                                        )}
                                    >
                                        {entry.syncStatus === 'SUCCESS'
                                            ? 'Đã đồng bộ'
                                            : entry.syncStatus === 'FAILED'
                                              ? 'Đồng bộ lỗi'
                                              : 'Đang đồng bộ'}
                                    </span>
                                    <span className="text-xs text-zinc-400">
                                        {formatAdminUserDate(entry.createdAt)}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 grid gap-3 border-t border-zinc-100 pt-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                                        Lý do thao tác
                                    </p>
                                    <p className="mt-1 text-sm text-zinc-700">
                                        {entry.reason ?? 'Không có lý do'}
                                    </p>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                                        Trạng thái audit
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-zinc-700">
                                        {entry.syncStatus}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 grid gap-2 md:grid-cols-2">
                                <div className="rounded-md border border-zinc-100 bg-zinc-50 p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                                        Before
                                    </p>
                                    <p className="mt-2 break-all font-mono text-xs leading-5 text-zinc-600">
                                        {renderAdminAuditJson(entry.before)}
                                    </p>
                                </div>
                                <div className="rounded-md border border-zinc-100 bg-zinc-50 p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                                        After
                                    </p>
                                    <p className="mt-2 break-all font-mono text-xs leading-5 text-zinc-600">
                                        {renderAdminAuditJson(entry.after)}
                                    </p>
                                </div>
                            </div>
                        </article>
                    ))
                ) : (
                    <p className="py-6 text-sm text-zinc-500">
                        Chưa có audit record.
                    </p>
                )}
            </div>
        </section>
    );
}
