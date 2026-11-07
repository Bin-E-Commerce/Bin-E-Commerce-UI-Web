// Thanh tìm kiếm sản phẩm trên header; chỉ điều phối truy vấn và điều hướng, không sở hữu API tìm kiếm.
'use client';
import { Button } from '@/components/ui/button';

import { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Giữ icon và nội dung nhập tách biệt bằng các nút icon có kích thước cố định cùng vùng đệm riêng.
export function SearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed) {
            router.push(`/products?q=${encodeURIComponent(trimmed)}`);
            inputRef.current?.blur();
        }
    }

    function handleClear() {
        setQuery('');
        inputRef.current?.focus();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                'relative hidden sm:flex items-center transition-all duration-300 ease-in-out',
                focused ? 'w-72 lg:w-80' : 'w-52 lg:w-64',
            )}
        >
            <Button
                variant="ghost"
                size="icon"
                type="submit"
                className="absolute left-1.5 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 transition-colors hover:text-zinc-700"
                aria-label="Tìm kiếm"
            >
                <Search className="h-4 w-4" />
            </Button>
            <input
                ref={inputRef}
                type="search"
                placeholder="Tìm kiếm sản phẩm…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="h-9 w-full rounded-lg bg-zinc-100 pl-11 pr-10 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-zinc-900/10 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
                <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={handleClear}
                    className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer rounded text-zinc-400 transition-colors hover:text-zinc-700"
                    aria-label="Xóa"
                >
                    <X className="h-3.5 w-3.5" />
                </Button>
            )}
        </form>
    );
}
