// Danh sách tài liệu toàn chiều rộng; bộ lọc mobile nằm trong Drawer để không bóp hẹp nội dung.

'use client';

import { useMemo, useState } from 'react';
import { BookOpen, FilePlus2, Filter, Search, X } from 'lucide-react';
import type {
    SellerKnowledgeDocument,
    SellerKnowledgeDomain,
} from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import {
    formatKnowledgeDate,
    getDocumentStatusClass,
    getDocumentStatusLabel,
} from '../utils/seller-knowledge-display';

import type {
    DocumentFilters,
    FilterChipProps,
    KnowledgeDocumentsPanelProps,
    StatusSelectProps,
} from '../types/documents/document.types';

// Hiển thị bộ lọc và danh sách tài liệu trong một vùng đọc rộng để mở chi tiết tài liệu.
export function KnowledgeDocumentsPanel({
    documents,
    domains,
    selectedDocumentId,
    filters,
    isLoading,
    hasError,
    onFiltersChange,
    onRetry,
    onSelectDocument,
    onCreateDocument,
}: KnowledgeDocumentsPanelProps) {
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [draftFilters, setDraftFilters] = useState({
        domain: filters.domain,
        status: filters.status,
    });
    const domainByCode = useMemo(
        () => new Map(domains.map((domain) => [domain.code, domain])),
        [domains],
    );
    const knowledgeDomains = useMemo(
        () => domains.filter((domain) => domain.kind === 'knowledge'),
        [domains],
    );
    const selectedDomain = domainByCode.get(filters.domain);
    const activeFilterCount =
        Number(Boolean(filters.domain)) + Number(Boolean(filters.status));
    const hasAnyFilter = Boolean(
        filters.search || filters.domain || filters.status,
    );

    // Thay đổi một bộ lọc giữ nguyên các bộ lọc còn lại để người dùng có thể kết hợp điều kiện.
    function updateFilter(key: keyof DocumentFilters, value: string) {
        onFiltersChange({ ...filters, [key]: value });
    }

    // Mở Drawer với giá trị hiện hành; thao tác chọn bên trong chỉ áp dụng khi người dùng xác nhận.
    function openFilterDrawer() {
        setDraftFilters({ domain: filters.domain, status: filters.status });
        setIsFilterDrawerOpen(true);
    }

    // Áp dụng hai điều kiện đã chọn cùng lúc để tránh danh sách nhấp nháy sau mỗi lần đổi Select.
    function applyMobileFilters() {
        onFiltersChange({ ...filters, ...draftFilters });
        setIsFilterDrawerOpen(false);
    }

    // Xóa riêng bộ lọc domain/trạng thái, không xóa từ khóa người dùng đang tìm.
    function clearMobileFilters() {
        setDraftFilters({ domain: '', status: '' });
    }

    // Xóa một chip mà vẫn giữ điều kiện lọc còn lại và từ khóa hiện tại.
    function removeFilter(key: 'domain' | 'status') {
        onFiltersChange({ ...filters, [key]: '' });
    }

    return (
        <section
            aria-labelledby="knowledge-documents-heading"
            className="space-y-5 rounded-xl border bg-card p-4 shadow-sm sm:p-5"
        >
            <div className="flex flex-col gap-4 border-b border-border/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2
                        id="knowledge-documents-heading"
                        className="text-lg font-semibold"
                    >
                        Kho tài liệu
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {isLoading
                            ? 'Đang tải tài liệu…'
                            : `${documents.length} tài liệu trong kết quả hiện tại`}
                    </p>
                </div>
                <Button type="button" onClick={onCreateDocument}>
                    <FilePlus2 />
                    Tạo tài liệu
                </Button>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="h-11 pl-9"
                        value={filters.search}
                        onChange={(event) =>
                            updateFilter('search', event.target.value)
                        }
                        placeholder="Tìm theo tên hoặc mã tài liệu"
                        aria-label="Tìm theo tên hoặc mã tài liệu"
                    />
                </div>
                <div className="hidden gap-2 md:flex">
                    <Select
                        value={filters.domain || 'all'}
                        onValueChange={(value) =>
                            updateFilter(
                                'domain',
                                value === 'all' ? '' : String(value ?? ''),
                            )
                        }
                    >
                        <SelectTrigger
                            className="h-11 w-80 flex-none data-[size=default]:h-11"
                            aria-label="Lọc theo nhóm nội dung"
                        >
                            <SelectValue className="min-w-0 truncate">
                                {selectedDomain
                                    ? getDomainFilterLabel(selectedDomain)
                                    : 'Mọi nhóm nội dung'}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="w-80">
                            <SelectItem value="all" className="min-h-10 py-2">
                                Mọi nhóm nội dung
                            </SelectItem>
                            {knowledgeDomains.map((domain) => (
                                <SelectItem
                                    key={domain.code}
                                    value={domain.code}
                                    className="min-h-10 py-2"
                                >
                                    {getDomainFilterLabel(domain)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <StatusSelect
                        value={filters.status}
                        onValueChange={(value) => updateFilter('status', value)}
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="h-11 justify-center md:hidden"
                    onClick={openFilterDrawer}
                >
                    <Filter />
                    Bộ lọc
                    {activeFilterCount > 0 && (
                        <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </div>

            {hasAnyFilter && (
                <div
                    className="flex flex-wrap items-center gap-2"
                    aria-label="Bộ lọc đang áp dụng"
                >
                    {filters.domain && (
                        <FilterChip
                            label={
                                selectedDomain
                                    ? getDomainFilterLabel(selectedDomain)
                                    : filters.domain
                            }
                            onRemove={() => removeFilter('domain')}
                        />
                    )}
                    {filters.status && (
                        <FilterChip
                            label={getDocumentStatusLabel(
                                filters.status as SellerKnowledgeDocument['status'],
                            )}
                            onRemove={() => removeFilter('status')}
                        />
                    )}
                    {filters.search && (
                        <FilterChip
                            label={`Từ khóa: ${filters.search}`}
                            onRemove={() => updateFilter('search', '')}
                        />
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            onFiltersChange({
                                search: '',
                                domain: '',
                                status: '',
                            })
                        }
                    >
                        Xóa tất cả
                    </Button>
                </div>
            )}

            {hasError ? (
                <Card
                    role="alert"
                    className="border-destructive/30 bg-destructive/5"
                >
                    <CardContent className="flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
                        <p className="text-sm text-destructive">
                            Chưa tải được danh sách tài liệu. Kiểm tra kết nối
                            rồi thử lại.
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onRetry}
                        >
                            Tải lại
                        </Button>
                    </CardContent>
                </Card>
            ) : isLoading ? (
                <div
                    className="space-y-3"
                    aria-label="Đang tải tài liệu"
                    aria-busy="true"
                >
                    {[0, 1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-24 animate-pulse rounded-xl border bg-muted/40"
                        />
                    ))}
                </div>
            ) : documents.length > 0 ? (
                <ul className="space-y-2">
                    {documents.map((document) => {
                        const domain = domainByCode.get(document.domainCode);
                        const isSelected = selectedDocumentId === document.id;

                        return (
                            <li key={document.id}>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    aria-pressed={isSelected}
                                    onClick={() =>
                                        onSelectDocument(document.id)
                                    }
                                    className={`h-auto w-full justify-start rounded-xl border p-4 text-left whitespace-normal transition-colors sm:p-5 ${isSelected ? 'border-foreground/30 bg-muted/60' : 'border-border/70 bg-card hover:border-foreground/20 hover:bg-muted/30'}`}
                                >
                                    <span className="flex w-full min-w-0 items-start gap-3 sm:items-center">
                                        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground sm:mt-0">
                                            <BookOpen className="size-4" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <span className="truncate text-sm font-semibold text-foreground sm:text-base">
                                                    {document.title}
                                                </span>
                                                <span className="flex shrink-0 flex-wrap items-center gap-2">
                                                    <span
                                                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getDocumentStatusClass(document.status)}`}
                                                    >
                                                        {getDocumentStatusLabel(
                                                            document.status,
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Cập nhật{' '}
                                                        {formatKnowledgeDate(
                                                            document.updatedAt,
                                                        )}
                                                    </span>
                                                </span>
                                            </span>
                                            <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                                <span>
                                                    {domain?.label ??
                                                        'Chưa gán nhóm'}
                                                </span>
                                                <span aria-hidden="true">
                                                    ·
                                                </span>
                                                <span>
                                                    {document.publishedRevisionId
                                                        ? 'Có phiên bản đang dùng'
                                                        : 'Chưa xuất bản'}
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </Button>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <Card className="border-dashed bg-muted/10">
                    <CardContent className="flex flex-col items-center px-6 py-14 text-center">
                        <span className="flex size-12 items-center justify-center rounded-2xl bg-background ring-1 ring-border">
                            <BookOpen className="size-5 text-muted-foreground" />
                        </span>
                        <h3 className="mt-4 font-semibold">
                            {hasAnyFilter
                                ? 'Không tìm thấy tài liệu phù hợp'
                                : 'Kho tài liệu đang trống'}
                        </h3>
                        <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                            {hasAnyFilter
                                ? 'Hãy đổi từ khóa hoặc bộ lọc để xem các tài liệu khác.'
                                : 'Tạo tài liệu đầu tiên để bắt đầu xây dựng nguồn nội dung cho BinGPT.'}
                        </p>
                        {hasAnyFilter ? (
                            <Button
                                type="button"
                                variant="outline"
                                className="mt-4"
                                onClick={() =>
                                    onFiltersChange({
                                        search: '',
                                        domain: '',
                                        status: '',
                                    })
                                }
                            >
                                Xóa bộ lọc
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                className="mt-4"
                                onClick={onCreateDocument}
                            >
                                <FilePlus2 />
                                Tạo tài liệu
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            <Drawer
                open={isFilterDrawerOpen}
                onOpenChange={setIsFilterDrawerOpen}
                swipeDirection="down"
            >
                <DrawerContent className="max-h-[82dvh]">
                    <DrawerHeader className="text-left">
                        <DrawerTitle>Bộ lọc tài liệu</DrawerTitle>
                        <DrawerDescription>
                            Thu hẹp danh sách theo nhóm nội dung hoặc trạng
                            thái.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="space-y-4 overflow-y-auto p-4">
                        <label className="block space-y-2 text-sm font-medium">
                            Nhóm nội dung
                            <Select
                                value={draftFilters.domain || 'all'}
                                onValueChange={(value) =>
                                    setDraftFilters((current) => ({
                                        ...current,
                                        domain:
                                            value === 'all'
                                                ? ''
                                                : String(value ?? ''),
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Mọi nhóm nội dung" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Mọi nhóm nội dung
                                    </SelectItem>
                                    {knowledgeDomains.map((domain) => (
                                        <SelectItem
                                            key={domain.code}
                                            value={domain.code}
                                        >
                                            {getDomainFilterLabel(domain)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </label>
                        <label className="block space-y-2 text-sm font-medium">
                            Trạng thái
                            <StatusSelect
                                value={draftFilters.status}
                                onValueChange={(status) =>
                                    setDraftFilters((current) => ({
                                        ...current,
                                        status,
                                    }))
                                }
                            />
                        </label>
                    </div>
                    <DrawerFooter className="flex-row border-t pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={clearMobileFilters}
                        >
                            Xóa lọc
                        </Button>
                        <Button
                            type="button"
                            className="flex-1"
                            onClick={applyMobileFilters}
                        >
                            Áp dụng bộ lọc
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </section>
    );
}

// Giữ cả domain ngừng sử dụng trong bộ lọc để tài liệu lưu trữ vẫn tìm được theo nhóm.
// Gắn nhãn trạng thái vào tên giúp phân biệt nhóm đang dùng với nhóm chỉ còn phục vụ tra cứu.
function getDomainFilterLabel(domain: SellerKnowledgeDomain): string {
    if (domain.status === 'ARCHIVED') {
        return `${domain.label} (Ngừng sử dụng)`;
    }

    if (domain.status === 'DRAFT') {
        return `${domain.label} (Bản nháp)`;
    }

    return domain.label;
}

// Dùng cùng bộ giá trị trạng thái ở desktop và mobile để filter luôn cho cùng kết quả.
function StatusSelect({ value, onValueChange }: StatusSelectProps) {
    const labels: Record<string, string> = {
        all: 'Mọi trạng thái',
        DRAFT: 'Bản nháp',
        PUBLISHED: 'Đã xuất bản',
        EXPIRED: 'Hết hiệu lực',
        ARCHIVED: 'Ngừng sử dụng',
    };
    const selectedValue = value || 'all';

    return (
        <Select
            value={selectedValue}
            onValueChange={(nextValue) =>
                onValueChange(
                    nextValue === 'all' ? '' : String(nextValue ?? ''),
                )
            }
        >
            <SelectTrigger
                className="h-11 w-full data-[size=default]:h-11 lg:w-48"
                aria-label="Lọc theo trạng thái"
            >
                <SelectValue>
                    {labels[selectedValue] ?? 'Mọi trạng thái'}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Mọi trạng thái</SelectItem>
                <SelectItem value="DRAFT">Bản nháp</SelectItem>
                <SelectItem value="PUBLISHED">Đã xuất bản</SelectItem>
                <SelectItem value="EXPIRED">Hết hiệu lực</SelectItem>
                <SelectItem value="ARCHIVED">Ngừng sử dụng</SelectItem>
            </SelectContent>
        </Select>
    );
}

// Hiển thị một điều kiện lọc có thể gỡ riêng, đồng thời giữ tên/ trạng thái dễ đọc thay cho mã API.
function FilterChip({ label, onRemove }: FilterChipProps) {
    return (
        <span className="inline-flex max-w-full items-center gap-1 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
            <span className="truncate">{label}</span>
            <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Bỏ bộ lọc ${label}`}
                onClick={onRemove}
            >
                <X />
            </Button>
        </span>
    );
}
