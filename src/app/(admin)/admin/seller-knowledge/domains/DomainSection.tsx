// Render danh sách nhóm theo nguồn; trạng thái knowledge có thể đổi, metadata hệ thống vẫn chỉ đọc.

import {
    AlertTriangle,
    BookOpen,
    FilePlus2,
    Layers3,
    Power,
    RotateCcw,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getDomainStatusClass } from '../utils/seller-knowledge-display';
import type { DomainSectionProps } from '../types/domains/domain.types';

// Dùng cùng card cho nhóm hệ thống và nhóm admin; chỉ hiện thao tác khi parent cấp handler.
// Nhóm archived thiếu tài liệu có CTA mở form đúng domain; publish không tự đưa domain trở lại planner.
// Đặt mã nhóm sau hàng nội dung để border phân cách luôn chạy hết chiều rộng card, kể cả khi có nút bên phải.
export function DomainSection({
    title,
    description,
    domains,
    emptyMessage,
    scrollable = false,
    isUpdating = false,
    statusError = null,
    onDismissStatusError,
    onOpenDocuments,
    onAddDocumentForDomain,
    onSetStatus,
}: DomainSectionProps) {
    return (
        <section className="space-y-4">
            <div className="rounded-xl border bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground shadow-sm">
                            <Layers3 className="size-4" aria-hidden="true" />
                        </span>
                        <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
                            {title}
                        </h3>
                    </div>
                    <span className="min-w-8 rounded-full border bg-background px-2.5 py-1 text-center text-xs font-semibold tabular-nums text-muted-foreground">
                        {domains.length}
                    </span>
                </div>
                <p className="mt-3 border-t border-border/70 pt-3 text-sm leading-5 text-muted-foreground">
                    {description}
                </p>
            </div>
            {domains.length === 0 ? (
                <Card className="border-dashed bg-muted/10">
                    <CardContent className="flex flex-col items-center px-5 py-10 text-center">
                        <Layers3 className="size-5 text-muted-foreground" />
                        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                            {emptyMessage}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <ul
                    className={`space-y-3 ${scrollable ? 'h-[min(65dvh,42rem)] overflow-y-auto overscroll-contain px-1 py-1 pr-3 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/50' : ''}`}
                >
                    {domains.map((domain) => (
                        <li key={domain.code}>
                            <Card className="rounded-xl bg-background shadow-sm transition-shadow hover:shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                                                <h4 className="text-sm font-semibold leading-5 text-foreground">
                                                    {domain.label}
                                                </h4>
                                                <span
                                                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getDomainStatusClass(domain.status)}`}
                                                >
                                                    {domain.status === 'ACTIVE'
                                                        ? 'Đang bật'
                                                        : domain.status ===
                                                            'DRAFT'
                                                          ? 'Bản nháp'
                                                          : 'Ngừng sử dụng'}
                                                </span>
                                                {domain.source === 'SYSTEM' && (
                                                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                                        Mặc định
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                                {domain.description}
                                            </p>
                                        </div>
                                        {onSetStatus && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="shrink-0"
                                                disabled={isUpdating}
                                                onClick={() =>
                                                    void onSetStatus(
                                                        domain.code,
                                                        domain.status ===
                                                            'ACTIVE'
                                                            ? 'ARCHIVED'
                                                            : 'ACTIVE',
                                                    )
                                                }
                                            >
                                                {domain.status === 'ACTIVE' ? (
                                                    <Power />
                                                ) : (
                                                    <RotateCcw />
                                                )}
                                                {domain.status === 'ACTIVE'
                                                    ? 'Ngừng sử dụng'
                                                    : 'Kích hoạt'}
                                            </Button>
                                        )}
                                    </div>
                                    {statusError?.code === domain.code && (
                                        <div
                                            role="alert"
                                            className="mt-4 flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
                                        >
                                            <AlertTriangle
                                                className="mt-0.5 size-4 shrink-0"
                                                aria-hidden="true"
                                            />
                                            <div className="min-w-0 flex-1 space-y-1">
                                                {statusError.kind ===
                                                'published-document-required' ? (
                                                    <>
                                                        <p className="font-semibold">
                                                            Chưa thể kích hoạt
                                                            nhóm này
                                                        </p>
                                                        <p className="leading-5">
                                                            Nhóm cần có ít nhất
                                                            một tài liệu đã xuất
                                                            bản.
                                                        </p>
                                                        {domain.status ===
                                                            'DRAFT' && (
                                                            <p className="leading-5">
                                                                Tạo tài liệu
                                                                thuộc nhóm này,
                                                                kiểm tra và xuất
                                                                bản rồi quay lại
                                                                kích hoạt.
                                                            </p>
                                                        )}
                                                        {domain.status ===
                                                            'ARCHIVED' && (
                                                            <>
                                                                <p className="leading-5">
                                                                    Nhóm đang
                                                                    ngừng sử
                                                                    dụng nên tài
                                                                    liệu chưa
                                                                    được BinGPT
                                                                    dùng. Hãy
                                                                    thêm và xuất
                                                                    bản tài liệu
                                                                    cho nhóm,
                                                                    sau đó quay
                                                                    lại kích
                                                                    hoạt.
                                                                </p>
                                                                {onAddDocumentForDomain && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="mt-2 h-8 bg-background"
                                                                        onClick={() =>
                                                                            onAddDocumentForDomain(
                                                                                domain.code,
                                                                            )
                                                                        }
                                                                    >
                                                                        <FilePlus2 />
                                                                        Thêm tài
                                                                        liệu mới
                                                                    </Button>
                                                                )}
                                                            </>
                                                        )}
                                                        {domain.status ===
                                                            'DRAFT' &&
                                                            onOpenDocuments && (
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="mt-2 h-8 bg-background"
                                                                    onClick={
                                                                        onOpenDocuments
                                                                    }
                                                                >
                                                                    <BookOpen />
                                                                    Mở kho tài
                                                                    liệu
                                                                </Button>
                                                            )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="font-semibold">
                                                            Không thể cập nhật
                                                            trạng thái nhóm
                                                        </p>
                                                        <p className="leading-5">
                                                            Máy chủ chưa xác
                                                            nhận kết quả. Danh
                                                            sách đang được tải
                                                            lại để kiểm tra
                                                            trạng thái; hãy xem
                                                            nhãn mới trước khi
                                                            thử lại.
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="-mr-2 -mt-2 size-8 shrink-0 text-amber-900 hover:bg-amber-100 hover:text-amber-950 dark:text-amber-100 dark:hover:bg-amber-900/60"
                                                aria-label="Đóng thông báo lỗi"
                                                onClick={onDismissStatusError}
                                            >
                                                <X className="size-4" />
                                            </Button>
                                        </div>
                                    )}
                                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/70 pt-3">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            Mã nhóm
                                        </span>
                                        <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground">
                                            {domain.code}
                                        </code>
                                    </div>
                                </CardContent>
                            </Card>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
