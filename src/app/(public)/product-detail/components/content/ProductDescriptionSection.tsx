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
        <section className="overflow-hidden border border-zinc-200 bg-white shadow-sm">
            <div className="px-5 py-6 sm:px-7">
                <ProductDescriptionBlocks
                    description={description}
                    shortDescription={shortDescription}
                />
            </div>
        </section>
    );
}
