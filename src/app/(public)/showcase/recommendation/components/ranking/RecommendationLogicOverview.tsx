// Tóm lược pipeline Recommendation trước các nhánh chi tiết; chỉ diễn giải giới hạn và policy mặc định đang có trong code.
'use client';

import { ArrowDownRight, Database, ShieldCheck } from 'lucide-react';
import { handleShowcaseAnchorNavigation } from '../../../utils/handleShowcaseAnchorNavigation';

// Giúp người đọc nắm thứ tự xử lý, ý nghĩa các giới hạn và nơi mở phần giải thích sâu hơn.
export function RecommendationLogicOverview() {
    return (
        <section className="space-y-6" aria-label="Tổng quan logic tạo gợi ý">
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                <div className="relative px-5 py-5 after:absolute after:inset-x-5 after:bottom-0 after:h-px after:bg-zinc-200 after:content-[''] sm:px-7 sm:py-6 sm:after:inset-x-7">
                    <div className="mt-2 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] lg:items-end">
                        <h3 className="max-w-2xl text-xl font-semibold tracking-tight text-zinc-950 sm:text-xl">
                            Tìm nhóm sản phẩm phù hợp, chấm điểm, rồi kiểm soát
                            danh sách trước khi trả về.
                        </h3>
                        <p className="text-sm leading-6 text-zinc-600">
                            Mỗi lần trang yêu cầu gợi ý, hệ thống xử lý để trả
                            danh sách ngay. Lượt xem, nhấp và đơn hàng được xử
                            lý nền qua Kafka; dữ liệu mới chỉ tác động đến những
                            request tiếp theo.
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 bg-white p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4">
                    <article className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            <span className="font-mono">01</span>
                            <span>Hiểu ngữ cảnh</span>
                        </div>
                        <h4 className="mt-3 text-sm font-semibold text-zinc-950">
                            Hồ sơ + phiên hiện tại
                        </h4>
                        <p className="mt-2 flex-1 text-xs leading-5 text-zinc-600">
                            Đọc sở thích đã tích lũy, hoạt động gần đây, màn
                            hình và sản phẩm đang xem để chọn gợi ý cá nhân hóa,
                            theo phiên hoặc dành cho khách mới.
                        </p>
                        <p className="mt-3 border-t border-zinc-100 pt-3 text-xs leading-5 text-zinc-500">
                            <strong className="font-semibold text-zinc-800">
                                Giải quyết:
                            </strong>{' '}
                            không dùng chung một danh sách cho mọi người.
                        </p>
                    </article>

                    <article className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            <span className="font-mono">02</span>
                            <span>Tạo tập ứng viên</span>
                        </div>
                        <h4 className="mt-3 text-sm font-semibold text-zinc-950">
                            Nhiều nguồn, một danh sách ứng viên
                        </h4>
                        <p className="mt-2 flex-1 text-xs leading-5 text-zinc-600">
                            Catalog tìm theo sản phẩm, danh mục, thương hiệu và
                            xu hướng; hệ thống còn có thể tìm mặt hàng gần nội
                            dung hoặc thường được xem/mua cùng nhau khi đủ dữ
                            liệu.
                        </p>
                        <p className="mt-3 border-t border-zinc-100 pt-3 text-xs leading-5 text-zinc-500">
                            <strong className="font-semibold text-zinc-800">
                                Giải quyết:
                            </strong>{' '}
                            mở rộng lựa chọn mà không để một nguồn quyết định
                            tất cả.
                        </p>
                    </article>

                    <article className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            <span className="font-mono">03</span>
                            <span>Chấm và cân bằng</span>
                        </div>
                        <h4 className="mt-3 text-sm font-semibold text-zinc-950">
                            Standard hoặc AI-Enhanced
                        </h4>
                        <p className="mt-2 flex-1 text-xs leading-5 text-zinc-600">
                            Standard chấm 8 tiêu chí trên cùng thang điểm.
                            AI-Enhanced dự đoán lại điểm trên chính danh sách
                            đó; bước cân bằng sau cùng tránh để một nhóm chiếm
                            quá nhiều vị trí.
                        </p>
                        <p className="mt-3 border-t border-zinc-100 pt-3 text-xs leading-5 text-zinc-500">
                            <strong className="font-semibold text-zinc-800">
                                Giải quyết:
                            </strong>{' '}
                            vừa có baseline giải thích được, vừa có đường thử ML
                            an toàn.
                        </p>
                    </article>

                    <article className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            <span className="font-mono">04</span>
                            <span>Trả kết quả, học sau</span>
                        </div>
                        <h4 className="mt-3 text-sm font-semibold text-zinc-950">
                            Response có thể đo lường
                        </h4>
                        <p className="mt-2 flex-1 text-xs leading-5 text-zinc-600">
                            Web nhận danh sách kèm thứ hạng, nguồn, lý do và mã
                            truy vết đã ký để nối lượt thấy/nhấp với đúng sản
                            phẩm. Consumer cập nhật dữ liệu nền cho request sau.
                        </p>
                        <p className="mt-3 border-t border-zinc-100 pt-3 text-xs leading-5 text-zinc-500">
                            <strong className="font-semibold text-zinc-800">
                                Giải quyết:
                            </strong>{' '}
                            giữ request nhanh và biết được item nào đã được hiển
                            thị.
                        </p>
                    </article>
                </div>
            </div>

            <div className="grid gap-4">
                <aside className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
                    <div className="relative flex items-center gap-3 pb-4 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-zinc-200 after:content-['']">
                        <span className="flex size-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-800">
                            <ShieldCheck
                                aria-hidden="true"
                                className="size-4"
                            />
                        </span>
                        <h3 className="text-base font-semibold text-zinc-950">
                            Trade-off cốt lõi
                        </h3>
                    </div>
                    <div className="mt-4 space-y-3 text-xs leading-5 text-zinc-600">
                        <p>
                            <strong className="text-zinc-900">
                                Cá nhân hóa ↔ khám phá:
                            </strong>{' '}
                            hồ sơ/phiên nặng hơn thì sát ý định hơn, nhưng ít cơ
                            hội thấy sản phẩm mới.
                        </p>
                        <p>
                            <strong className="text-zinc-900">
                                Độ phủ ↔ tốc độ:
                            </strong>{' '}
                            thêm nguồn và ứng viên có thể tăng lựa chọn, nhưng
                            làm request miss tốn truy vấn và tính điểm hơn.
                        </p>
                        <p>
                            <strong className="text-zinc-900">
                                ML ↔ khả năng kiểm soát:
                            </strong>{' '}
                            model có thể học tương tác phức tạp, đổi lại cần
                            inference ổn định và attribution đủ tin cậy; lỗi thì
                            quay về Standard.
                        </p>
                    </div>
                    <div className="mt-5 border-t border-zinc-200 pt-4">
                        <p className="text-xs font-semibold text-zinc-900">
                            Đi sâu theo câu hỏi
                        </p>
                        <nav
                            className="mt-3 flex flex-wrap gap-2"
                            aria-label="Đi đến phần logic Recommendation"
                        >
                            <a
                                href="#recommendation-signal-logic"
                                aria-controls="recommendation-signal-logic"
                                onClick={handleShowcaseAnchorNavigation}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
                            >
                                Dữ liệu & ứng viên{' '}
                                <ArrowDownRight
                                    aria-hidden="true"
                                    className="size-3.5"
                                />
                            </a>
                            <a
                                href="#recommendation-ranking-logic"
                                aria-controls="recommendation-ranking-logic"
                                onClick={handleShowcaseAnchorNavigation}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
                            >
                                Công thức xếp hạng{' '}
                                <ArrowDownRight
                                    aria-hidden="true"
                                    className="size-3.5"
                                />
                            </a>
                            <a
                                href="#recommendation-reliability-logic"
                                aria-controls="recommendation-reliability-logic"
                                onClick={handleShowcaseAnchorNavigation}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
                            >
                                Fallback & đo lường{' '}
                                <ArrowDownRight
                                    aria-hidden="true"
                                    className="size-3.5"
                                />
                            </a>
                        </nav>
                    </div>
                </aside>
            </div>

            <p className="flex items-start gap-2 px-1 text-xs leading-5 text-zinc-500">
                <Database
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0"
                />
                Các phần dưới giải thích dữ liệu đến từ đâu, từng điểm số ảnh
                hưởng thế nào và hệ thống cân bằng độ mới, đa dạng với tốc độ ra
                sao.
            </p>
        </section>
    );
}
