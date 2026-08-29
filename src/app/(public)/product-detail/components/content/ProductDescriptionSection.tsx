'use client';

//
// Section mô tả sản phẩm trên trang customer.
// Component chỉ dựng khung section và giao việc trình bày hai loại mô tả cho
// ProductDescriptionBlocks dùng chung với trang chi tiết của seller.
//
import { ProductDescriptionBlocks } from './ProductDescriptionBlocks';

interface ProductDescriptionSectionProps {
    description?: string | null;
    shortDescription?: string | null;
}

// Giữ tiêu đề section nhất quán giữa storefront và Seller Center, còn nội dung chi tiết được render bằng component dùng chung.
export function ProductDescriptionSection({
    description,
    shortDescription,
}: ProductDescriptionSectionProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 px-5 py-4 sm:px-7">
                <p className="text-xs font-semibold uppercase text-zinc-500">
                    Nội dung sản phẩm
                </p>
                <h2 className="mt-1 text-xl font-bold text-zinc-950">
                    Mô tả sản phẩm
                </h2>
            </div>
            <div className="px-5 py-6 sm:px-7">
                <ProductDescriptionBlocks
                    description={description}
                    shortDescription={shortDescription}
                />
            </div>
        </section>
    );
}
