// Trình bày luồng fail-soft, giới hạn request và ghi nhận phản hồi của Recommendation.
// Component chỉ diễn giải hành vi hiện có ở backend/Web; không thực thi fallback hay thay đổi event contract.
import {
    Check,
    Clock3,
    Fingerprint,
    RotateCcw,
    ShieldCheck,
} from 'lucide-react';
import { RecommendationDisclosure } from '../shared/RecommendationDisclosure';

// Giải thích dữ liệu đi qua hệ thống, cách từng lỗi được cô lập và feedback cập nhật cho request sau.
export function RecommendationReliability() {
    return (
        <section className="space-y-5">
            <RecommendationDisclosure
                id="recommendation-fallback-request-flow"
                number="2.3.1"
                title="Dự phòng theo từng bước trong request"
                description="Mỗi bước có giới hạn và đường dự phòng riêng. Khi một phần thiếu dữ liệu, hệ thống giữ phần còn dùng được thay vì buộc toàn luồng thất bại."
                level={4}
                variant="flow"
            >
                <div className="rounded-3xl border border-zinc-200 bg-white p-3 sm:p-4">
                    <div className="grid gap-3 bg-white lg:grid-cols-3">
                        <article className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                            <div className="flex items-center gap-3">
                                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-700">
                                    <RotateCcw
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </span>
                                <div>
                                    <p className="font-mono text-[10px] font-semibold tracking-widest text-zinc-400">
                                        01 · TÌM SẢN PHẨM
                                    </p>
                                    <h4 className="mt-1 text-sm font-semibold text-zinc-950">
                                        Một nguồn lỗi, nguồn khác vẫn chạy
                                    </h4>
                                </div>
                            </div>
                            <dl className="mt-4 space-y-3 text-xs leading-5">
                                <div>
                                    <dt className="font-semibold text-zinc-900">
                                        Đầu vào
                                    </dt>
                                    <dd className="mt-0.5 text-zinc-600">
                                        Hồ sơ, phiên hiện tại, sản phẩm đang xem
                                        và các nguồn catalog/vector/hành vi.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-semibold text-zinc-900">
                                        Xử lý → đầu ra
                                    </dt>
                                    <dd className="mt-0.5 text-zinc-600">
                                        Các nguồn chạy độc lập. Nguồn rỗng hoặc
                                        lỗi bị bỏ qua; nguồn còn lại được gộp,
                                        bỏ trùng thành tối đa 300 sản phẩm chờ
                                        xếp hạng.
                                    </dd>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-3 text-zinc-600">
                                    <strong className="text-zinc-900">
                                        Đánh đổi:
                                    </strong>{' '}
                                    vẫn trả được gợi ý khi một nguồn lỗi, nhưng
                                    danh sách có thể ít lựa chọn hơn.
                                </div>
                            </dl>
                        </article>

                        <article className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                            <div className="flex items-center gap-3">
                                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-700">
                                    <Clock3
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </span>
                                <div>
                                    <p className="font-mono text-[10px] font-semibold tracking-widest text-zinc-400">
                                        02 · CHẤM ĐIỂM
                                    </p>
                                    <h4 className="mt-1 text-sm font-semibold text-zinc-950">
                                        AI chậm thì quay về Standard
                                    </h4>
                                </div>
                            </div>
                            <dl className="mt-4 space-y-3 text-xs leading-5">
                                <div>
                                    <dt className="font-semibold text-zinc-900">
                                        Đầu vào
                                    </dt>
                                    <dd className="mt-0.5 text-zinc-600">
                                        Danh sách sản phẩm chờ xếp hạng và các
                                        điểm tiêu chí đã chuẩn hóa.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-semibold text-zinc-900">
                                        Xử lý → đầu ra
                                    </dt>
                                    <dd className="mt-0.5 text-zinc-600">
                                        Standard luôn tạo điểm nền. Nếu bật AI,
                                        hệ thống chờ tối đa 150ms mặc định. Điểm
                                        AI không hợp lệ thì món đó giữ Standard;
                                        nếu lần gọi AI lỗi hoặc quá hạn, cả danh
                                        sách dùng Standard.
                                    </dd>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-3 text-zinc-600">
                                    <strong className="text-zinc-900">
                                        Đánh đổi:
                                    </strong>{' '}
                                    timeout ngắn giữ request nhanh nhưng có thể
                                    fallback thường xuyên hơn. Lượt fallback
                                    không bị tính nhầm là AI khi fallback.
                                </div>
                            </dl>
                        </article>

                        <article className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                            <div className="flex items-center gap-3">
                                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-700">
                                    <ShieldCheck
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </span>
                                <div>
                                    <p className="font-mono text-[10px] font-semibold tracking-widest text-zinc-400">
                                        03 · TRẢ KẾT QUẢ
                                    </p>
                                    <h4 className="mt-1 text-sm font-semibold text-zinc-950">
                                        Giới hạn list, có phương án hiển thị
                                    </h4>
                                </div>
                            </div>
                            <dl className="mt-4 space-y-3 text-xs leading-5">
                                <div>
                                    <dt className="font-semibold text-zinc-900">
                                        Đầu vào
                                    </dt>
                                    <dd className="mt-0.5 text-zinc-600">
                                        Danh sách sản phẩm đã chấm điểm, chưa áp
                                        giới hạn hiển thị.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-semibold text-zinc-900">
                                        Xử lý → đầu ra
                                    </dt>
                                    <dd className="mt-0.5 text-zinc-600">
                                        Áp quy tắc đa dạng rồi trả danh sách
                                        theo trang. Nếu API recommendation lỗi,
                                        Web dùng catalog có sẵn ở trang chủ hoặc
                                        món bán chạy ở trang chi tiết.
                                    </dd>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-3 text-zinc-600">
                                    <strong className="text-zinc-900">
                                        Đánh đổi:
                                    </strong>{' '}
                                    giới hạn bảo vệ tốc độ và payload, nhưng món
                                    ở sâu trong danh sách có thể không được trả
                                    về.
                                </div>
                            </dl>
                        </article>
                    </div>
                </div>
            </RecommendationDisclosure>

            <RecommendationDisclosure
                id="recommendation-feedback-flow"
                number="2.3.2"
                title="Ghi nhận tương tác hợp lệ, cập nhật hồ sơ ở nền"
                description="Đo tương tác có căn cứ mà không bắt người dùng chờ hệ thống ghi event."
                level={4}
                variant="flow"
            >
                <div className="rounded-3xl border border-zinc-200 bg-white p-3 sm:p-4">
                    <div className="grid gap-3 bg-white md:grid-cols-3">
                        <article className="rounded-2xl border border-zinc-200 bg-white p-4">
                            <span className="grid size-8 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-700">
                                <Check aria-hidden="true" className="size-4" />
                            </span>
                            <p className="mt-3 font-mono text-[10px] font-semibold tracking-widest text-zinc-400">
                                01 · GHI NHẬN
                            </p>
                            <h5 className="mt-1 text-sm font-semibold text-zinc-950">
                                Có thấy hoặc có nhấp thật
                            </h5>
                            <p className="mt-1.5 text-xs leading-5 text-zinc-600">
                                Impression chỉ ghi khi ít nhất 50% thẻ sản phẩm
                                hiện trong màn hình. Click mang token đã ký để
                                xác định đúng món, thứ hạng, nguồn và ranking
                                mode.
                            </p>
                        </article>
                        <article className="rounded-2xl border border-zinc-200 bg-white p-4">
                            <span className="grid size-8 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-700">
                                <Fingerprint
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </span>
                            <p className="mt-3 font-mono text-[10px] font-semibold tracking-widest text-zinc-400">
                                02 · XÁC THỰC
                            </p>
                            <h5 className="mt-1 text-sm font-semibold text-zinc-950">
                                Gắn event với đúng gợi ý
                            </h5>
                            <p className="mt-1.5 text-xs leading-5 text-zinc-600">
                                Token giúp đối chiếu item và attribution. Thiếu
                                attribution hợp lệ thì event có thể còn là hành
                                vi chung, nhưng không được tính vào phép đo
                                recommendation.
                            </p>
                        </article>
                        <article className="rounded-2xl border border-zinc-200 bg-white p-4">
                            <span className="grid size-8 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-700">
                                <RotateCcw
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </span>
                            <p className="mt-3 font-mono text-[10px] font-semibold tracking-widest text-zinc-400">
                                03 · CẬP NHẬT
                            </p>
                            <h5 className="mt-1 text-sm font-semibold text-zinc-950">
                                Dùng cho request kế tiếp
                            </h5>
                            <p className="mt-1.5 text-xs leading-5 text-zinc-600">
                                Client gom tối đa 20 event mỗi lần gửi; Kafka
                                consumer cập nhật hồ sơ sau đó. Vì xử lý bất
                                đồng bộ, event mới không làm đổi ngay danh sách
                                đang xem.
                            </p>
                        </article>
                    </div>
                    <p className="mt-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs leading-5 text-zinc-600">
                        <strong className="text-zinc-900">Đánh đổi:</strong>{' '}
                        ngưỡng 50% tránh tính thẻ chỉ vừa ló vào màn hình là đã
                        được thấy, nhưng có thể bỏ sót lượt nhìn rất nhanh. Gửi
                        theo lô và xử lý nền giảm request/chờ đợi, đổi lại
                        feedback cập nhật trễ.
                    </p>
                </div>
            </RecommendationDisclosure>
        </section>
    );
}
