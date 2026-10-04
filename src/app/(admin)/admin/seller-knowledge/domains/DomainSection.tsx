// Render danh sách nhóm theo nguồn; chỉ nhóm do admin tạo mới nhận thao tác đổi trạng thái.

import { Archive, Layers3, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getDomainStatusClass } from '../utils/seller-knowledge-display';
import type { DomainSectionProps } from '../types/domains/domain.types';

// Dùng cùng cách trình bày cho nhóm hệ thống và nhóm admin, đồng thời giữ quyền thao tác ở đúng nguồn dữ liệu.
export function DomainSection({
    title,
    description,
    domains,
    emptyMessage,
    scrollable = false,
    isUpdating = false,
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
                                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                                            <h4 className="text-sm font-semibold leading-5 text-foreground">
                                                {domain.label}
                                            </h4>
                                            <span
                                                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getDomainStatusClass(domain.status)}`}
                                            >
                                                {domain.status === 'ACTIVE'
                                                    ? 'Đang sử dụng'
                                                    : domain.status === 'DRAFT'
                                                      ? 'Bản nháp'
                                                      : 'Đã lưu trữ'}
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
                                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/70 pt-3">
                                            <span className="text-xs font-medium text-muted-foreground">
                                                Mã nhóm
                                            </span>
                                            <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground">
                                                {domain.code}
                                            </code>
                                        </div>
                                    </div>
                                    {onSetStatus && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="shrink-0"
                                            disabled={isUpdating}
                                            onClick={() =>
                                                onSetStatus(
                                                    domain.code,
                                                    domain.status === 'ACTIVE'
                                                        ? 'ARCHIVED'
                                                        : 'ACTIVE',
                                                )
                                            }
                                        >
                                            {domain.status === 'ACTIVE' ? (
                                                <Archive />
                                            ) : (
                                                <RotateCcw />
                                            )}
                                            {domain.status === 'ACTIVE'
                                                ? 'Lưu trữ'
                                                : 'Kích hoạt'}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
