// Trình bày quy trình kiểm chứng và giới hạn pilot; không hiển thị metric cũ không còn gắn với model hiện tại.

import { AlertTriangle, CheckCircle2, Database, Scale } from 'lucide-react';

import { RecommendationDisclosure } from '../shared/RecommendationDisclosure';

// Tách kiểm tra công thức khỏi kiểm tra khả năng xếp hạng trên dữ liệu chưa thấy.
export function RecommendationModelEvaluation() {
    return (
        <RecommendationDisclosure
            id="recommendation-ranking-evaluation"
            number="2.2.3"
            title="Kiểm chứng code và hiệu quả xếp hạng"
            description="Có hai câu hỏi cần trả lời riêng: feature có được tính đúng theo đặc tả không, và model có xếp tốt hơn các baseline trên các request tương lai không?"
            level={4}
            variant="flow"
        >
            <div className="space-y-4">
                <section className="grid gap-3 md:grid-cols-3">
                    <article className="rounded-xl border border-zinc-200 bg-white p-4">
                        <CheckCircle2
                            className="size-4 text-emerald-700"
                            aria-hidden="true"
                        />
                        <h5 className="mt-3 text-sm font-semibold text-zinc-950">
                            1 · Kiểm tra feature
                        </h5>
                        <p className="mt-2 text-xs leading-5 text-zinc-600">
                            Unit/property tests đối chiếu từng công thức với
                            ví dụ tính tay: miền [0, 1], tính đơn điệu, decay,
                            giới hạn và xử lý dữ liệu thiếu.
                        </p>
                    </article>
                    <article className="rounded-xl border border-zinc-200 bg-white p-4">
                        <Scale
                            className="size-4 text-indigo-700"
                            aria-hidden="true"
                        />
                        <h5 className="mt-3 text-sm font-semibold text-zinc-950">
                            2 · So sánh ranker
                        </h5>
                        <p className="mt-2 text-xs leading-5 text-zinc-600">
                            LambdaRank được so với từng feature đơn lẻ và
                            đánh giá bỏ lần lượt từng feature. Mọi phương án
                            dùng cùng request test và nhãn.
                        </p>
                    </article>
                    <article className="rounded-xl border border-zinc-200 bg-white p-4">
                        <Database
                            className="size-4 text-zinc-700"
                            aria-hidden="true"
                        />
                        <h5 className="mt-3 text-sm font-semibold text-zinc-950">
                            3 · Chia theo thời gian
                        </h5>
                        <p className="mt-2 text-xs leading-5 text-zinc-600">
                            Train dùng request cũ nhất, validation dùng giai
                            đoạn kế tiếp, test dùng giai đoạn mới nhất. Các
                            candidate cùng request phải ở cùng một split.
                        </p>
                    </article>
                </section>

                <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
                    <h5 className="text-sm font-semibold text-zinc-950">
                        Chỉ số cần đọc
                    </h5>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-zinc-50 p-3">
                            <p className="font-mono text-xs font-semibold text-zinc-900">
                                NDCG@10 · chính
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                Đo chất lượng thứ tự trong 10 vị trí đầu và
                                phạt candidate liên quan nằm thấp hơn.
                            </p>
                        </div>
                        <div className="rounded-lg bg-zinc-50 p-3">
                            <p className="font-mono text-xs font-semibold text-zinc-900">
                                Recall@10 · bổ trợ
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                Đo tỷ lệ sản phẩm có tương tác tích cực được
                                tìm thấy trong 10 vị trí đầu.
                            </p>
                        </div>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-zinc-600">
                        Cần báo cả số query, số candidate mỗi query, tỷ lệ
                        positive và chênh lệch với baseline. Nếu test quá nhỏ
                        hoặc mỗi query có dưới 10 candidate, NDCG@10 không đủ
                        để kết luận về một danh sách top 10 thực tế.
                    </p>
                </section>

                <section className="rounded-xl border border-amber-300 bg-amber-50 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                        <AlertTriangle
                            className="mt-0.5 size-4 shrink-0 text-amber-800"
                            aria-hidden="true"
                        />
                        <div>
                            <h5 className="text-sm font-semibold text-amber-950">
                                Pilot hiện tại chưa chứng minh model xếp hạng tốt
                            </h5>
                            <p className="mt-2 text-xs leading-5 text-amber-950">
                                Manifest pilot cũ ghi 338 dòng, 54 dòng test và
                                chỉ 4 sản phẩm catalog. Vì mỗi request có tối
                                đa 4 candidate, NDCG@10 đang tính trên gần như
                                toàn bộ danh sách. Dữ liệu này được mô phỏng,
                                nên chỉ dùng để kiểm tra pipeline; không chứng
                                minh hiệu quả với khách hàng thật.
                            </p>
                            <p className="mt-2 text-xs leading-5 text-amber-950">
                                Trainer hiện yêu cầu timestamp theo request và
                                split có thứ tự thời gian. Cần sinh lại dataset
                                đủ rộng hoặc dùng impression log thật trước khi
                                công bố con số so sánh.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </RecommendationDisclosure>
    );
}
