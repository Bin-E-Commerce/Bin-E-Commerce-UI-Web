// Trang tổng quan dự án và ba hệ thống showcase; chỉ giới thiệu, điều hướng, không chứa logic nghiệp vụ hay số liệu runtime.
import { ArrowDown, Globe } from 'lucide-react';
import Image from 'next/image';
import { ShowcaseFeatureCard } from '../shared/ShowcaseFeatureCard';

// Dẫn người xem từ tổng quan Bin E-Commerce qua hình minh họa và credit tác giả, rồi mới mở ba case study bên dưới.
export function ShowcaseLanding() {
    return (
        <main className="bg-zinc-50 text-zinc-950">
            <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 md:px-0">
                <section
                    aria-labelledby="showcase-page-title"
                    className="grid overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_14px_40px_-34px_rgba(24,24,27,0.2)] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.8fr)_minmax(0,1fr)]"
                >
                    <div className="flex min-w-0 flex-col justify-center p-4 sm:p-6 lg:p-5">
                        <div>
                            <h1
                                id="showcase-page-title"
                                className="text-xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-2xl lg:text-[1.65rem]"
                            >
                                Hệ thống đứng sau trải nghiệm mua sắm.
                            </h1>
                            <p className="mt-2 text-[11px] leading-[1.3rem] text-zinc-600 sm:text-xs">
                                Khám phá cách Bin E-Commerce kết nối dịch vụ, dữ
                                liệu và AI trong toàn bộ hành trình thương mại.
                            </p>
                        </div>
                    </div>

                    <div className="relative aspect-[16/9] w-full overflow-hidden border-y border-zinc-200 bg-white lg:aspect-auto lg:min-h-[19rem] lg:border-y-0 lg:border-x">
                        <Image
                            src="/images/background-showcase/background.png"
                            alt="Minh họa Bin E-Commerce với hành trình mua sắm, gợi ý cá nhân hóa, AI, microservices và hạ tầng cloud."
                            fill
                            priority
                            sizes="(min-width: 1024px) 48vw, 100vw"
                            className="object-contain"
                        />
                    </div>

                    <aside
                        aria-label="Mục tiêu hệ thống và người thiết kế sản phẩm"
                        className="flex flex-col justify-between gap-5 bg-zinc-50/80 p-4 sm:p-5 lg:p-4"
                    >
                        <div>
                            <h2 className="text-base font-semibold leading-5 tracking-tight text-zinc-950">
                                AI cho cả người mua lẫn người bán
                            </h2>
                            <p className="mt-2 text-[11px] leading-[1.4rem] text-zinc-600">
                                Gợi ý cá nhân hóa giúp người mua khám phá sản
                                phẩm; AI hỗ trợ người bán tạo ảnh, xem trước và
                                duyệt trước khi cập nhật gian hàng.
                            </p>
                        </div>
                        <div className="border-t border-zinc-200 pt-3">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                                Người thiết kế sản phẩm
                            </p>
                            <div className="mt-3 flex items-center gap-3">
                                <Image
                                    src="/images/avatar/avatar.jpg"
                                    alt="Ảnh đại diện của Đào Ngọc Anh"
                                    width={40}
                                    height={40}
                                    className="size-10 shrink-0 rounded-xl border border-zinc-200 object-cover"
                                />
                                <div>
                                    <p className="text-sm font-semibold tracking-tight text-zinc-950">
                                        Đào Ngọc Anh
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-zinc-600">
                                        Software Engineer
                                    </p>
                                </div>
                            </div>
                            <a
                                href="https://daongocanh.site/"
                                target="_blank"
                                rel="noreferrer"
                                className="group mt-4 flex w-full items-center justify-between gap-3 rounded-xl bg-zinc-950 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
                            >
                                Xem portfolio
                                <span
                                    aria-hidden="true"
                                    className="flex size-7 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-zinc-100 transition-colors group-hover:bg-white/15"
                                >
                                    <Globe className="size-3.5" />
                                </span>
                            </a>
                        </div>
                    </aside>
                </section>

                <section
                    aria-labelledby="showcase-feature-title"
                    className="space-y-4 sm:space-y-5"
                >
                    <header className="flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                    FEATURE BIN E-COMMERCE
                                </p>
                            </div>
                            <h2
                                id="showcase-feature-title"
                                className="mt-1 text-xl font-semibold leading-tight tracking-tight text-zinc-950 sm:text-2xl"
                            >
                                Khám phá ba hệ thống nổi bật
                            </h2>
                        </div>
                        <div className="inline-flex items-center gap-2 self-start rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-600 sm:self-auto">
                            <span>Chọn một card để xem chi tiết</span>
                            <ArrowDown
                                aria-hidden="true"
                                className="size-3.5 text-zinc-400"
                            />
                        </div>
                    </header>

                    <div className="grid gap-4 lg:grid-cols-3">
                        <ShowcaseFeatureCard
                            href="/showcase/recommendation"
                            imageSrc="/images/feature/recommendation/img.png"
                            imageAlt="Minh họa hệ thống phân tích tín hiệu người mua và xếp hạng sản phẩm gợi ý."
                            title="Gợi ý sản phẩm cá nhân hóa"
                            description="Kết hợp sở thích, hành vi phiên và độ phù hợp sản phẩm để xếp hạng gợi ý. Standard làm nền ổn định; AI chỉ điều chỉnh khi có dự đoán hợp lệ."
                        />
                        <ShowcaseFeatureCard
                            href="/showcase/ai-optimization"
                            imageSrc="/images/feature/ai-image-optimization/img.png"
                            imageAlt="Minh họa quy trình AI tạo ảnh sản phẩm, xem trước và chờ người bán duyệt trước khi áp dụng."
                            title="Tối ưu ảnh sản phẩm có kiểm duyệt"
                            description="Tạo ảnh nền trắng hoặc lifestyle, xem trước kết quả rồi duyệt trước khi cập nhật. Có lưu phiên bản để dễ dàng khôi phục khi cần."
                        />
                        <ShowcaseFeatureCard
                            href="/showcase/authorization-management"
                            imageSrc="/images/feature/authorization/image.png"
                            imageAlt="Minh họa hệ thống phân quyền với role, permission, scope, audit và navigation theo quyền hiệu lực."
                            title="Quản trị phân quyền"
                            description="RBAC kết hợp permission và scope để kiểm soát đúng người, đúng hành động, đúng shop; profile và navigation được backend lọc, thay đổi quyền có audit và cache invalidation."
                        />
                    </div>
                </section>
            </div>
        </main>
    );
}
