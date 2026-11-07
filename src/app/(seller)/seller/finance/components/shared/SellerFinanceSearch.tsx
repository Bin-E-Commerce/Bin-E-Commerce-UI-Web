// Ô tìm kiếm dùng chung cho bảng seller finance; truy vấn chỉ phát sau khi người dùng dừng gõ.
'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { SellerFinanceSearchProps } from '../../types/shared/seller-finance-search.types';

// Đồng bộ giá trị ngoài và debounce từ khóa để phân trang/query không chạy theo từng phím bấm.
export function SellerFinanceSearch({
    value,
    label,
    placeholder,
    onSearchChange,
}: SellerFinanceSearchProps) {
    const [draft, setDraft] = useState(value);
    const onSearchChangeRef = useRef(onSearchChange);

    // Giữ callback mới nhất mà không khởi động lại debounce khi component cha render.
    useEffect(() => {
        onSearchChangeRef.current = onSearchChange;
    }, [onSearchChange]);

    // Đồng bộ khi cha reset bộ lọc hoặc chuyển về trạng thái ban đầu.
    useEffect(() => {
        setDraft(value);
    }, [value]);

    // Chỉ gửi từ khóa đã trim sau 300 ms; chuỗi rỗng sẽ xóa bộ lọc phía server.
    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            const normalized = draft.trim();
            if (normalized !== value) onSearchChangeRef.current(normalized);
        }, 300);

        return () => window.clearTimeout(timeoutId);
    }, [draft, value]);

    return (
        <div className="border-b border-zinc-100 bg-white px-5 py-3.5 sm:px-6">
            <div className="relative w-full">
                <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
                    aria-hidden="true"
                />
                <Input
                    type="search"
                    aria-label={label}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={placeholder}
                    maxLength={100}
                    className="h-10 rounded-xl border-zinc-200 bg-zinc-50/70 pl-9 shadow-none placeholder:text-zinc-400 focus-visible:bg-white"
                />
            </div>
        </div>
    );
}
