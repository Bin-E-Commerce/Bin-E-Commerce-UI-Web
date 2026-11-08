// Bộ lọc dùng chung cho các danh sách tài chính admin; debounce tìm kiếm để tránh gọi API theo từng phím.
'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { FinanceTableToolbarProps } from '../../types/shared/finance-table-toolbar.types';

// Đồng bộ hai bộ lọc với trạng thái trang; ô tìm kiếm chỉ phát từ khóa đã trim sau một nhịp dừng gõ.
export function FinanceTableToolbar({
    searchValue,
    searchPlaceholder,
    searchLabel,
    onSearchChange,
    statusValue,
    statusLabel = 'Lọc trạng thái',
    statusOptions,
    onStatusChange,
}: FinanceTableToolbarProps) {
    const [draftSearch, setDraftSearch] = useState(searchValue);
    const onSearchChangeRef = useRef(onSearchChange);

    // Lưu callback mới nhất để debounce không phải khởi động lại nếu component cha render lại.
    useEffect(() => {
        onSearchChangeRef.current = onSearchChange;
    }, [onSearchChange]);

    // Đồng bộ draft khi bộ lọc đổi từ bên ngoài, ví dụ khi xóa điều kiện hoặc chuyển bảng.
    useEffect(() => {
        setDraftSearch(searchValue);
    }, [searchValue]);

    // Chỉ phát từ khóa sau khi người dùng dừng gõ; callback của cha sẽ đặt lại trang về đầu.
    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            const normalizedSearch = draftSearch.trim();
            if (normalizedSearch !== searchValue) {
                onSearchChangeRef.current(normalizedSearch);
            }
        }, 300);

        return () => window.clearTimeout(timeoutId);
    }, [draftSearch, searchValue]);

    return (
        <div className="border-b border-zinc-100 bg-white px-5 py-3.5 sm:px-6">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
                        aria-hidden="true"
                    />
                    <Input
                        type="search"
                        aria-label={searchLabel}
                        value={draftSearch}
                        onChange={(event) => setDraftSearch(event.target.value)}
                        placeholder={searchPlaceholder}
                        maxLength={100}
                        className="h-10 rounded-xl border-zinc-200 bg-zinc-50/70 pl-9 shadow-none placeholder:text-zinc-400 focus-visible:bg-white"
                    />
                </div>
                {statusOptions && onStatusChange ? (
                    <div className="flex min-w-0 items-center gap-2 sm:w-56 sm:shrink-0">
                        <SlidersHorizontal
                            className="size-4 shrink-0 text-zinc-400"
                            aria-hidden="true"
                        />
                        <Select
                            value={statusValue ?? statusOptions[0]?.value ?? ''}
                            onValueChange={(value) => {
                                if (value !== null) onStatusChange(value);
                            }}
                        >
                            <SelectTrigger
                                aria-label={statusLabel}
                                className="h-10 min-h-10 min-w-0 w-full rounded-xl border-zinc-200 bg-zinc-50/70 px-3 shadow-none focus-visible:bg-white"
                            >
                                {/* Giá trị API như ALL không phải nhãn giao diện; luôn đổi về tên trạng thái đã dịch. */}
                                <SelectValue placeholder={statusLabel}>
                                    {(value) =>
                                        statusOptions.find(
                                            (option) => option.value === value,
                                        )?.label ?? statusLabel
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
