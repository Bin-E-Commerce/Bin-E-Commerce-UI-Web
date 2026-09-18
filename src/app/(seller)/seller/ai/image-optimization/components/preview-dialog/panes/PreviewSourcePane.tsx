// Khung hiển thị ảnh gốc trước khi AI xử lý.
// URL chỉ dùng để trình bày; việc xác minh asset đã diễn ra ở bước tạo job.

import { ImageIcon } from 'lucide-react';
import { PreviewImage } from './PreviewImage';

interface PreviewSourcePaneProps {
    sourceImage: string | null;
    productName: string;
}

// Hiển thị ảnh nguồn và hướng dẫn thao tác kính lúp cho seller.
export function PreviewSourcePane({
    sourceImage,
    productName,
}: PreviewSourcePaneProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    <ImageIcon className="size-4" aria-hidden="true" />
                    Ảnh hiện tại
                </div>
                <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Bản gốc
                </span>
            </div>
            <div className="flex h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-[0_18px_45px_-30px_rgba(24,24,27,0.45)] sm:h-[440px]">
                {sourceImage ? (
                    <PreviewImage
                        src={sourceImage}
                        alt={`Ảnh hiện tại của ${productName}`}
                    />
                ) : (
                    <div className="flex flex-col items-center gap-3 text-zinc-400">
                        <ImageIcon className="size-12" aria-hidden="true" />
                        <span className="text-sm">Chưa có ảnh sản phẩm</span>
                    </div>
                )}
            </div>
            <p className="text-xs text-zinc-500">
                Di chuột lên ảnh để xem chi tiết. Dùng phím Tab để tiếp cận vùng
                phóng đại.
            </p>
        </div>
    );
}
