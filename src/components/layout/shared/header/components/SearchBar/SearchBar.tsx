// Entry point tìm kiếm trên header; desktop có autocomplete còn mobile mở thẳng trang tìm kiếm toàn màn hình.
'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ProductSearchBox } from '@/features/product-search/components/ProductSearchBox';

// Giữ header gọn trên điện thoại nhưng vẫn để người dùng truy cập nhanh vào ô tìm kiếm đầy đủ.
export function SearchBar() {
    const router = useRouter();

    return (
        <div className="flex min-w-0 items-center">
            <div className="hidden sm:block">
                <ProductSearchBox variant="header" />
            </div>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Mở tìm kiếm sản phẩm hoặc cửa hàng"
                className="sm:hidden"
                onClick={() => router.push('/products')}
            >
                <Search className="size-5" />
            </Button>
        </div>
    );
}
