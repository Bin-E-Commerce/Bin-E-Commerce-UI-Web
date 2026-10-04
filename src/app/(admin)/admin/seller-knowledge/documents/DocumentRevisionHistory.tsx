// Hiển thị lịch sử revision và thao tác khôi phục; không sở hữu query hay quyền publish.

import { Clock3, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatKnowledgeDate } from '../utils/seller-knowledge-display';
import type { DocumentRevisionHistoryProps } from '../types/documents/document.types';

// Giữ lịch sử, điều kiện rollback và lý do khôi phục cùng nhau để rule nghiệp vụ không bị rải trong workspace.
export function DocumentRevisionHistory({
    document,
    revisions,
    rollbackReason,
    isRollingBack,
    onRollbackReasonChange,
    onLoadPreview,
    onRollback,
}: DocumentRevisionHistoryProps) {
    const hasRestorableRevision = revisions.some((revision) =>
        ['PUBLISHED', 'SUPERSEDED'].includes(revision.status),
    );

    return (
        <div
            id="document-panel-history"
            role="tabpanel"
            aria-labelledby="document-tab-history"
            tabIndex={0}
            className="space-y-4 py-5"
        >
            {document.publishedRevisionId && (
                <div className="rounded-xl border bg-muted/40 p-4 text-sm text-foreground">
                    Phiên bản đang được sử dụng: bản{' '}
                    {revisions.find(
                        (revision) =>
                            revision.id === document.publishedRevisionId,
                    )?.revisionNumber ?? 'đã xuất bản'}
                    .
                </div>
            )}
            {revisions.length === 0 ? (
                <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Tài liệu chưa có phiên bản nào.
                </p>
            ) : (
                <ol className="space-y-3">
                    {revisions.map((revision) => {
                        const isPublished =
                            revision.id === document.publishedRevisionId;

                        return (
                            <li
                                key={revision.id}
                                className="rounded-xl border p-4"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                            <Clock3 className="size-4 text-muted-foreground" />
                                        </span>
                                        <div>
                                            <p className="font-semibold">
                                                Bản {revision.revisionNumber}
                                                {isPublished && (
                                                    <span className="ml-2 rounded-full border border-foreground bg-foreground px-2 py-0.5 text-[11px] font-medium text-background">
                                                        Đang sử dụng
                                                    </span>
                                                )}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                <span
                                                    className={
                                                        revision.status ===
                                                        'FAILED'
                                                            ? 'font-medium text-destructive'
                                                            : undefined
                                                    }
                                                >
                                                    {revision.status === 'DRAFT'
                                                        ? 'Bản nháp'
                                                        : revision.status ===
                                                            'VALIDATED'
                                                          ? 'Đã kiểm tra'
                                                          : revision.status ===
                                                              'PUBLISHED'
                                                            ? 'Đã xuất bản'
                                                            : revision.status ===
                                                                'SUPERSEDED'
                                                              ? 'Đã được thay thế'
                                                              : 'Xuất bản chưa thành công'}
                                                </span>
                                                {' · '}
                                                {formatKnowledgeDate(
                                                    revision.createdAt,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                onLoadPreview(revision.id)
                                            }
                                        >
                                            Xem nội dung
                                        </Button>
                                        {['PUBLISHED', 'SUPERSEDED'].includes(
                                            revision.status,
                                        ) && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    onRollback(
                                                        document.id,
                                                        revision.id,
                                                        rollbackReason,
                                                    )
                                                }
                                                disabled={
                                                    rollbackReason.trim()
                                                        .length < 5 ||
                                                    isRollingBack ||
                                                    document.status ===
                                                        'ARCHIVED'
                                                }
                                            >
                                                <RotateCcw />
                                                Khôi phục
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
            {hasRestorableRevision && (
                <label className="block space-y-2 text-sm font-medium">
                    Lý do khôi phục
                    <Input
                        value={rollbackReason}
                        onChange={(event) =>
                            onRollbackReasonChange(event.target.value)
                        }
                        placeholder="Nêu ngắn gọn vì sao cần dùng lại phiên bản này"
                    />
                </label>
            )}
        </div>
    );
}
