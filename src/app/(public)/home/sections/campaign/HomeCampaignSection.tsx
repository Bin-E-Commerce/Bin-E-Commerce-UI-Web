import Image from 'next/image';
import { ArrowRight, BadgeCheck } from 'lucide-react';

// Tạo hero chính của homepage theo hướng visual-first: nội dung chữ ở nền tối,
// ảnh lifestyle ở bên phải và CTA dẫn thẳng tới danh sách sản phẩm.
// Ảnh nền được đặt trong public để designer thay thế độc lập mà không phải sửa JSX.
export function HomeCampaignSection() {
    return (
        <section className="bg-zinc-100 px-3 pb-3 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <article
                    aria-labelledby="home-campaign-title"
                    className="relative isolate min-h-[480px] overflow-hidden rounded-[1.5rem] bg-zinc-950 text-white shadow-[0_24px_60px_-36px_rgba(24,24,27,0.65)] sm:min-h-[580px] lg:min-h-[640px]"
                >
                    <div className="relative z-20 flex min-h-[480px] w-full flex-col justify-center px-6 py-10 sm:min-h-[580px] sm:px-10 lg:min-h-[640px] lg:w-[49%] lg:px-12">
                        <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-200 sm:text-xs">
                            <BadgeCheck className="h-4 w-4" />
                            Thời trang · Công nghệ · Phụ kiện
                        </span>
                        <h1
                            id="home-campaign-title"
                            className="max-w-xl text-2xl font-bold leading-[1.08] tracking-[-0.035em] sm:text-4xl lg:text-[3rem]"
                        >
                            Chọn đúng sản phẩm,
                            <br />
                            mua sắm dễ dàng hơn.
                        </h1>
                        <p className="mt-5 max-w-md text-sm leading-6 text-zinc-300 sm:text-base">
                            Khám phá với hàng ngàn sản phẩm chất lượng, từ thời
                            trang, phụ kiện đến công nghệ, tất cả đều được tuyển
                            chọn để phù hợp với gu của bạn.
                        </p>
                        <a
                            href="#products"
                            className="mt-7 inline-flex h-12 w-fit items-center gap-3 rounded-xl bg-white px-5 text-sm font-bold text-zinc-950 transition-transform hover:-translate-y-0.5 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                        >
                            Mua sắm ngay
                            <ArrowRight className="h-4 w-4" />
                        </a>
                    </div>

                    <div className="absolute inset-y-0 right-0 z-10 w-full overflow-hidden bg-zinc-100 lg:w-[64%]">
                        <Image
                            src="/images/home/hero/bin-ecommerce-home-hero.png"
                            alt="Thời trang, phụ kiện và sản phẩm công nghệ nổi bật"
                            fill
                            priority
                            sizes="(max-width: 1023px) 100vw, 64vw"
                            className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/35 to-transparent lg:from-zinc-950 lg:via-zinc-950/15 lg:to-transparent" />
                        <div className="absolute right-5 top-5 z-20 flex aspect-square w-28 flex-col justify-center rounded-2xl bg-white/95 p-2.5 text-zinc-950 shadow-[0_18px_40px_-20px_rgba(24,24,27,0.7)] backdrop-blur-sm sm:right-8 sm:top-8 sm:w-36 sm:p-3 lg:right-10 lg:top-10">
                            <p className="text-center text-xs font-bold uppercase leading-[1.55] tracking-[0.06em] text-zinc-500 sm:text-sm">
                                Đúng gu
                                <br />
                                Đúng giá
                                <br />
                                Đúng món
                                <br />
                                Mỗi ngày
                            </p>
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
}
