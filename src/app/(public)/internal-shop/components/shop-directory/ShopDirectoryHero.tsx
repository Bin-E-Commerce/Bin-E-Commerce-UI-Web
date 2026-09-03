// Hero giới thiệu mục shop nội bộ; component chỉ sở hữu nội dung định hướng và không gọi dữ liệu.

// Giải thích giá trị của shop nội bộ và giới hạn dữ liệu để người dùng hiểu đúng trước khi khám phá.
export function ShopDirectoryHero() {
    return (
        <section className="rounded-3xl border border-zinc-200 bg-white shadow-sm motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-700">
            <div className="grid gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.6fr)] lg:items-center lg:gap-0 lg:px-14">
                <div className="lg:pr-14"><h1 className="max-w-xl text-2xl font-bold tracking-tight text-zinc-950 sm:leading-tight">Chọn shop nội bộ để bắt đầu trải nghiệm.</h1><p className="mt-4 max-w-lg text-sm leading-6 text-zinc-600 sm:text-base">Khám phá sản phẩm, xem thông tin shop và trải nghiệm quy trình mua hàng thật trên Bin E-Commerce.</p></div>
                <div className="grid gap-0 rounded-2xl border border-zinc-200 bg-zinc-50/70 sm:grid-cols-3 sm:divide-x sm:divide-zinc-200 lg:ml-2 lg:border-0 lg:bg-transparent">
                    <InfoItem number="01" title="Vì sao crawl dữ liệu?">Bổ sung nhiều <strong>ngành hàng</strong> để kiểm thử <strong>tìm kiếm</strong> và <strong>gợi ý sản phẩm</strong> sát thực tế hơn.</InfoItem>
                    <InfoItem number="02" title="Phạm vi dữ liệu">Có <strong>sản phẩm</strong> và <strong>shop</strong>; chưa có tài khoản người bán, tồn kho, thanh toán và vận chuyển thực tế.</InfoItem>
                    <InfoItem number="03" title="Test đơn hàng">Chọn <strong>shop nội bộ</strong> để trải nghiệm từ <strong>thêm vào giỏ</strong> đến <strong>đặt đơn</strong>.</InfoItem>
                </div>
            </div>
        </section>
    );
}

// Render một điểm thông tin ngắn với cấu trúc đồng nhất trên desktop và mobile.
function InfoItem({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
    return <div className="border-b border-zinc-200 p-4 last:border-b-0 sm:border-b-0 sm:px-5 lg:px-7"><div className="flex items-center gap-2"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-[10px] font-bold text-zinc-600">{number}</span><p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{title}</p></div><p className="mt-2 text-sm leading-6 text-zinc-700">{children}</p></div>;
}
