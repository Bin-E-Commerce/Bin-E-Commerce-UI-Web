// Route này chỉ lắp trang gợi ý sản phẩm vào Public Layout; dữ liệu và quyền truy cập thuộc feature.

import { Suspense } from 'react';

import { RecommendationsPageContent } from './components/RecommendationsPageContent';

// Tạo fallback nhẹ cho lớp Suspense vì trang gợi ý đọc số trang từ query string trên client.
export default function RecommendationsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[560px] bg-zinc-100 px-3 py-8 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 shadow-sm">
                        Đang chuẩn bị gợi ý dành cho bạn...
                    </div>
                </div>
            }
        >
            <RecommendationsPageContent />
        </Suspense>
    );
}
