// Giải thích mô hình LambdaRank đang dùng để học thứ tự candidate và các ranh giới train/serving.

import { RecommendationDisclosure } from '../shared/RecommendationDisclosure';

// Nêu rõ input, mục tiêu học, cách phục vụ và điều kiện lỗi để showcase khớp code thật.
export function RecommendationLambdaRank() {
    return (
        <RecommendationDisclosure
            id="recommendation-lambdarank"
            number="2.2.2"
            title="Model LambdaRank học cách xếp hạng"
            description="Tám tiêu chí là feature đầu vào. LightGBM LambdaRank học cách kết hợp chúng từ nhãn tương tác theo từng request."
            level={4}
            variant="flow"
        >
            <div className="grid gap-3 lg:grid-cols-3">
                <section className="rounded-xl border border-zinc-200 bg-white p-4">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                        Dữ liệu huấn luyện
                    </p>
                    <h5 className="mt-2 text-sm font-semibold text-zinc-950">
                        Candidate được nhóm theo request
                    </h5>
                    <p className="mt-2 text-xs leading-5 text-zinc-600">
                        Mỗi dòng chứa 9 feature, nhãn nhị phân và requestId.
                        Các sản phẩm trong cùng request tạo thành một nhóm để
                        model học thứ tự có ý nghĩa trong cùng danh sách.
                    </p>
                </section>

                <section className="rounded-xl border border-zinc-200 bg-white p-4">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                        Mục tiêu
                    </p>
                    <h5 className="mt-2 text-sm font-semibold text-zinc-950">
                        Ưu tiên đổi chỗ có ích ở top-K
                    </h5>
                    <p className="mt-2 text-xs leading-5 text-zinc-600">
                        LambdaRank tính tín hiệu học theo cặp candidate và mức
                        thay đổi NDCG khi đổi vị trí. Score đầu ra chỉ có ý
                        nghĩa tương đối trong danh sách; nó không phải xác suất.
                    </p>
                    <code className="mt-3 block overflow-x-auto rounded-lg bg-zinc-50 px-3 py-2 font-mono text-[11px] leading-5 text-zinc-800">
                        score = LambdaRank(featureVector)
                    </code>
                </section>

                <section className="rounded-xl border border-zinc-200 bg-white p-4">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                        Serving
                    </p>
                    <h5 className="mt-2 text-sm font-semibold text-zinc-950">
                        Chỉ dùng artifact đã kiểm tra
                    </h5>
                    <p className="mt-2 text-xs leading-5 text-zinc-600">
                        Registry xác minh objective LambdaRank, model version
                        và số feature. Recommendation xếp theo raw score rồi
                        mới áp dụng diversity.
                    </p>
                </section>

                <section className="rounded-xl border border-zinc-200 bg-white p-4 lg:col-span-3">
                    <h5 className="text-sm font-semibold text-zinc-950">
                        Nếu model chưa sẵn sàng
                    </h5>
                    <p className="mt-2 text-xs leading-5 text-zinc-600">
                        AI Service trả 503 khi chưa có artifact hợp lệ. Request
                        recommendation không trả danh sách được xếp hạng bằng model khác và không
                        ghi attribution như thể LambdaRank đã chạy.
                        Trạng thái model được hiển thị riêng trong trang quản
                        trị.
                    </p>
                </section>
            </div>
        </RecommendationDisclosure>
    );
}
