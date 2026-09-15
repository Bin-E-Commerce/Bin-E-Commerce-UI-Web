// Tóm lược các ứng dụng và service tham gia Recommendation; không mô tả công nghệ nền hoặc thay thế sơ đồ xử lý chi tiết.
import {
    Activity,
    BrainCircuit,
    Layers,
    PackageCheck,
    Radio,
    ShieldCheck,
    ShoppingCart,
    Store,
} from 'lucide-react';
import { RecommendationDisclosure } from '../shared/RecommendationDisclosure';

// Phân biệt luồng phục vụ request với luồng event nền bằng hai nhóm card riêng; bốn service trong mỗi nhóm giữ cùng thứ bậc trình bày.
export function RecommendationServicesOverview() {
    return (
        <RecommendationDisclosure
            id="recommendation-services-overview"
            number="1.3"
            title="Các service tham gia"
            description="Request gợi ý chạy riêng với cập nhật event nền: service phục vụ người mua không phải chờ consumer xử lý xong."
            level={3}
            variant="section"
        >
            <div className="space-y-4">
            <RecommendationDisclosure
                id="recommendation-sync-services"
                number="1.3.1"
                title="Luồng trả gợi ý · đồng bộ"
                description="Đi theo thứ tự từ giao diện đến bộ xếp hạng."
                level={4}
                variant="section"
            >
                <ol className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <li className="flex h-full min-w-0 flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/[0.03]">
                        <div className="flex items-center gap-2.5">
                            <Store
                                aria-hidden="true"
                                className="size-4 shrink-0 text-zinc-700"
                            />
                            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                01 · Web
                            </span>
                        </div>
                        <h5 className="mt-3 text-sm font-semibold text-zinc-950">
                            Web Storefront
                        </h5>
                        <p className="mt-1.5 text-xs leading-5 text-zinc-600">
                            Gọi API gợi ý, hiển thị kết quả và gửi
                            impression/click gắn với đúng request.
                        </p>
                    </li>

                    <li className="flex h-full min-w-0 flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/[0.03]">
                        <div className="flex items-center gap-2.5">
                            <ShieldCheck
                                aria-hidden="true"
                                className="size-4 shrink-0 text-zinc-700"
                            />
                            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                02 · Cổng API
                            </span>
                        </div>
                        <h5 className="mt-3 text-sm font-semibold text-zinc-950">
                            API Gateway
                        </h5>
                        <p className="mt-1.5 text-xs leading-5 text-zinc-600">
                            Chuyển tiếp request/event cùng identity user hoặc
                            session; không tự tạo hay xếp hạng gợi ý.
                        </p>
                    </li>

                    <li className="flex h-full min-w-0 flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/[0.03]">
                        <div className="flex items-center gap-2.5">
                            <Layers
                                aria-hidden="true"
                                className="size-4 shrink-0 text-zinc-700"
                            />
                            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                03 · Điều phối
                            </span>
                        </div>
                        <h5 className="mt-3 text-sm font-semibold text-zinc-950">
                            Recommendation Service
                        </h5>
                        <p className="mt-1.5 text-xs leading-5 text-zinc-600">
                            Đọc cache/ngữ cảnh, gom ứng viên, xếp hạng và trả
                            sản phẩm kèm nguồn, lý do, attribution.
                        </p>
                    </li>

                    <li className="flex h-full min-w-0 flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/[0.03]">
                        <div className="flex items-center gap-2.5">
                            <BrainCircuit
                                aria-hidden="true"
                                className="size-4 shrink-0 text-zinc-700"
                            />
                            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                04 · Khi dùng AI
                            </span>
                        </div>
                        <h5 className="mt-3 text-sm font-semibold text-zinc-950">
                            AI Service
                        </h5>
                        <p className="mt-1.5 text-xs leading-5 text-zinc-600">
                            Dự đoán điểm cho AI-Enhanced; nếu prediction không
                            dùng được, Recommendation quay về Standard.
                        </p>
                    </li>
                </ol>
            </RecommendationDisclosure>

            <RecommendationDisclosure
                id="recommendation-async-services"
                number="1.3.2"
                title="Nguồn dữ liệu & cập nhật nền · bất đồng bộ"
                description="Các nguồn phát event; Kafka phân phối tới worker nội bộ."
                level={4}
                variant="section"
            >
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <li className="flex h-full min-w-0 flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/[0.03]">
                        <div className="flex items-center gap-2.5">
                            <Activity
                                aria-hidden="true"
                                className="size-4 shrink-0 text-zinc-700"
                            />
                            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                Tín hiệu sử dụng
                            </span>
                        </div>
                        <h5 className="mt-3 text-sm font-semibold text-zinc-950">
                            Web + Gateway
                        </h5>
                        <p className="mt-1.5 text-xs leading-5 text-zinc-600">
                            Gửi lượt xem, click, tìm kiếm và thêm giỏ vào luồng
                            ghi nhận hành vi.
                        </p>
                    </li>

                    <li className="flex h-full min-w-0 flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/[0.03]">
                        <div className="flex items-center gap-2.5">
                            <PackageCheck
                                aria-hidden="true"
                                className="size-4 shrink-0 text-zinc-700"
                            />
                            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                Dữ liệu catalog
                            </span>
                        </div>
                        <h5 className="mt-3 text-sm font-semibold text-zinc-950">
                            Product Service
                        </h5>
                        <p className="mt-1.5 text-xs leading-5 text-zinc-600">
                            Phát thay đổi sản phẩm; Recommendation đồng bộ vào
                            catalog read model riêng.
                        </p>
                    </li>

                    <li className="flex h-full min-w-0 flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/[0.03]">
                        <div className="flex items-center gap-2.5">
                            <ShoppingCart
                                aria-hidden="true"
                                className="size-4 shrink-0 text-zinc-700"
                            />
                            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                Giao dịch thật
                            </span>
                        </div>
                        <h5 className="mt-3 text-sm font-semibold text-zinc-950">
                            Order Service
                        </h5>
                        <p className="mt-1.5 text-xs leading-5 text-zinc-600">
                            Phát đơn hoàn tất/hoàn trả qua outbox để tín hiệu
                            mua dựa trên giao dịch đã xác nhận.
                        </p>
                    </li>

                    <li className="flex h-full min-w-0 flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/[0.03]">
                        <div className="flex items-center gap-2.5">
                            <Radio
                                aria-hidden="true"
                                className="size-4 shrink-0 text-zinc-700"
                            />
                            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                Phân phối &amp; projection
                            </span>
                        </div>
                        <h5 className="mt-3 text-sm font-semibold text-zinc-950">
                            Kafka + workers
                        </h5>
                        <p className="mt-1.5 text-xs leading-5 text-zinc-600">
                            Consumer trong Recommendation cập nhật catalog,
                            profile/session và quan hệ sản phẩm cho request sau.
                        </p>
                    </li>
                </ul>
            </RecommendationDisclosure>

            <p className="mt-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-[11px] leading-4 text-zinc-600">
                <strong className="font-semibold text-zinc-900">
                    Ranh giới service:
                </strong>{' '}
                Catalog read model và Kafka consumer là module/worker bên trong
                Recommendation Service, không phải microservice độc lập. Request
                gợi ý đọc dữ liệu đã đồng bộ, không truy cập trực tiếp database
                của Product hoặc Order.
            </p>
            </div>
        </RecommendationDisclosure>
    );
}
