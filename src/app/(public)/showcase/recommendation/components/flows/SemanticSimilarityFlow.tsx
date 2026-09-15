// Trình bày vòng đời semantic retrieval từ lúc chuẩn bị vector đến lúc bàn giao candidate.
// Component chỉ diễn giải luồng đang có; không tạo embedding, gọi Qdrant hay tự xếp hạng sản phẩm.

import { ArrowRight, Database } from 'lucide-react';
import { RecommendationDisclosure } from '../shared/RecommendationDisclosure';
import { RecommendationStepHeader } from '../shared/RecommendationStepHeader';

// Giải thích cách nội dung catalog biến thành query vector và được kiểm tra trước khi thành candidate.
// Trọng số minh họa cùng các giới hạn bên dưới phản ánh contract của SemanticCandidateService và VectorIndexService.
// Request chỉ đọc vector đã được lập chỉ mục; thiếu vector hoặc dữ liệu không khớp thì source trả rỗng để nguồn khác tiếp tục.
export function SemanticSimilarityFlow() {
    return (
        <RecommendationDisclosure
            id="recommendation-semantic-flow-title"
            number="2.1.3.3"
            title="Tìm sản phẩm gần nghĩa bằng nội dung, không chỉ bằng danh mục"
            description="Dùng khi tên, mô tả hoặc thuộc tính sản phẩm diễn đạt khác nhau nhưng vẫn nói về nhu cầu tương tự. Luồng này tạo thêm ứng viên; nó không kết luận khách chắc chắn muốn mua."
            level={5}
            variant="flow"
        >
            <div className="space-y-3">
                <div className="flex flex-wrap justify-end gap-1.5">
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[10px] font-medium text-zinc-600">Qdrant</span>
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[10px] font-medium text-zinc-600">Top 60</span>
                </div>
                <section className="rounded-xl border border-zinc-200 bg-white p-3" aria-label="Chuẩn bị vector sản phẩm trước request">
                    <RecommendationStepHeader number="01" eyebrow="Chuẩn bị trước · bất đồng bộ" title="Vector catalog được tạo trước request gợi ý" description="Recommendation request không gọi model để tạo embedding mới." titleLevel={5} />
                    <ol className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4" aria-label="Bốn bước lập chỉ mục nội dung sản phẩm">
                        <li className="rounded-lg border border-zinc-200 bg-white p-3">
                            <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-zinc-400">01 · NỘI DUNG</p>
                            <p className="mt-1 text-[11px] font-semibold text-zinc-800">Catalog snapshot</p>
                            <p className="mt-1 text-[10px] leading-4 text-zinc-500">Tên, thương hiệu, đường dẫn danh mục, mô tả và thuộc tính.</p>
                        </li>
                        <li className="rounded-lg border border-zinc-200 bg-white p-3">
                            <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-zinc-400">02 · CHUẨN HÓA</p>
                            <p className="mt-1 text-[11px] font-semibold text-zinc-800">Tạo nội dung chuẩn + hash</p>
                            <p className="mt-1 text-[10px] leading-4 text-zinc-500">Loại HTML, chuẩn Unicode/khoảng trắng, giới hạn độ dài; hash chỉ đổi khi nội dung ngữ nghĩa đổi.</p>
                        </li>
                        <li className="rounded-lg border border-zinc-200 bg-white p-3">
                            <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-zinc-400">03 · EMBEDDING JOB</p>
                            <p className="mt-1 text-[11px] font-semibold text-zinc-800">Tạo vector ngoài request</p>
                            <p className="mt-1 text-[10px] leading-4 text-zinc-500">Job phát yêu cầu; worker embedding xử lý theo model/số chiều cấu hình rồi cập nhật Qdrant. Giá, tồn kho không buộc tạo lại vector.</p>
                        </li>
                        <li className="rounded-lg border border-zinc-200 bg-white p-3">
                            <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-zinc-400">04 · LƯU VECTOR</p>
                            <p className="mt-1 text-[11px] font-semibold text-zinc-800">Qdrant · trạng thái READY</p>
                            <p className="mt-1 text-[10px] leading-4 text-zinc-500">Lưu vector cùng productId, contentHash và modelVersion để request tra đúng phiên bản.</p>
                        </li>
                    </ol>
                </section>

                <div aria-hidden="true" className="flex justify-center py-0.5"><ArrowRight className="size-4 rotate-90 text-zinc-400" /></div>

                <section className="rounded-xl border border-zinc-200 bg-white p-3" aria-label="Các bước tìm sản phẩm tương tự trong request">
                    <RecommendationStepHeader number="02" eyebrow="Khi có request · retrieval online" title="Từ ngữ cảnh người mua đến tối đa 60 candidate" description="Mỗi bước chỉ đọc hoặc biến đổi dữ liệu đã có." titleLevel={5} />
                    <ol className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5" aria-label="Năm bước semantic retrieval">
                        <li className="rounded-xl border border-zinc-200 bg-white p-3">
                            <span className="grid size-6 place-items-center rounded-lg border border-zinc-200 bg-white font-mono text-[10px] font-semibold text-zinc-600">01</span>
                            <h6 className="mt-2 text-xs font-semibold text-zinc-950">Chọn anchor (món làm mốc)</h6>
                            <p className="mt-1.5 text-[11px] leading-[1.6] text-zinc-600">Món đang xem có trọng số 1; lấy tối đa 5 món gần đây theo event weight dương (thiếu thì dùng 1, bằng 0/âm thì bỏ); lấy tối đa 5 món sở thích hồ sơ, mỗi món × 0,5.</p>
                        </li>
                        <li className="rounded-xl border border-zinc-200 bg-white p-3">
                            <span className="grid size-6 place-items-center rounded-lg border border-zinc-200 bg-white font-mono text-[10px] font-semibold text-zinc-600">02</span>
                            <h6 className="mt-2 text-xs font-semibold text-zinc-950">Nạp vector hợp lệ</h6>
                            <p className="mt-1.5 text-[11px] leading-[1.6] text-zinc-600">Khử trùng anchor và cộng trọng số nếu trùng ID. Đọc vector theo productId + contentHash; chỉ nhận vector READY, đúng model, đúng số chiều và toàn giá trị hữu hạn.</p>
                        </li>
                        <li className="rounded-xl border border-zinc-200 bg-white p-3">
                            <span className="grid size-6 place-items-center rounded-lg border border-zinc-200 bg-white font-mono text-[10px] font-semibold text-zinc-600">03</span>
                            <h6 className="mt-2 text-xs font-semibold text-zinc-950">Tạo vector truy vấn</h6>
                            <p className="mt-1.5 text-[11px] leading-[1.6] text-zinc-600">Tính trung bình có trọng số của vector các anchor. Món đang xem hoặc event mạnh tác động nhiều hơn; hồ sơ dài hạn vẫn bổ sung ngữ cảnh.</p>
                        </li>
                        <li className="rounded-xl border border-zinc-200 bg-white p-3">
                            <span className="grid size-6 place-items-center rounded-lg border border-zinc-200 bg-white font-mono text-[10px] font-semibold text-zinc-600">04</span>
                            <h6 className="mt-2 text-xs font-semibold text-zinc-950">Tìm láng giềng</h6>
                            <p className="mt-1.5 text-[11px] leading-[1.6] text-zinc-600">Qdrant tìm gần nhất theo metric cấu hình (Cosine mặc định), tối đa 60. Chỉ xét hàng ACTIVE, còn tồn, embedding READY, đúng model và không thuộc danh sách loại trừ.</p>
                        </li>
                        <li className="rounded-xl border border-zinc-200 bg-white p-3">
                            <span className="grid size-6 place-items-center rounded-lg border border-zinc-200 bg-white font-mono text-[10px] font-semibold text-zinc-600">05</span>
                            <h6 className="mt-2 text-xs font-semibold text-zinc-950">Kiểm tra rồi hydrate</h6>
                            <p className="mt-1.5 text-[11px] leading-[1.6] text-zinc-600">Lấy thông tin sản phẩm từ Catalog. Chỉ nhận kết quả nếu contentHash trong Qdrant vẫn bằng snapshot hiện tại; raw similarity được giữ làm bằng chứng cho ranking.</p>
                        </li>
                    </ol>
                </section>

                <div aria-hidden="true" className="flex justify-center py-0.5"><ArrowRight className="size-4 rotate-90 text-zinc-400" /></div>

                <section className="rounded-xl border border-zinc-200 bg-white p-3" aria-label="Công thức và đầu ra semantic similarity">
                    <RecommendationStepHeader number="03" eyebrow="Đầu ra · chuẩn hóa" title="Tạo feature semantic để bàn giao sang ranking" titleLevel={5} />
                    <div className="mt-3 grid gap-2 lg:grid-cols-[1.05fr_0.95fr]">
                    <article className="rounded-lg border border-zinc-200 bg-white p-3" aria-label="Công thức tạo vector truy vấn">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Công thức · gộp nhiều ý định thành một query</p>
                        <p className="mt-2 break-words rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm font-semibold text-zinc-900 sm:text-base">q = Σ(wᵢ × vᵢ) / Σwᵢ</p>
                        <p className="mt-2 text-[11px] leading-5 text-zinc-600"><strong className="font-semibold text-zinc-800">vᵢ</strong> là vector nội dung của sản phẩm anchor; <strong className="font-semibold text-zinc-800">wᵢ</strong> là mức ưu tiên từ ngữ cảnh. Ví dụ: món đang xem = 1, món vừa thêm giỏ = event weight, món hồ sơ = 0,5. Nếu cùng một ID xuất hiện ở nhiều nhóm, trọng số được cộng trước khi tính.</p>
                        <p className="mt-2 text-[10px] leading-4 text-zinc-500">Đây là weighted mean của vector đã có, không phải cộng điểm sản phẩm và không phải AI sinh danh sách bằng prompt.</p>
                    </article>

                    <article className="rounded-lg border border-zinc-200 bg-white p-3" aria-label="Đầu ra và giới hạn semantic similarity">
                        <div className="flex items-center gap-2">
                            <Database aria-hidden="true" className="size-3.5 text-zinc-500" />
                            <p className="text-xs font-semibold text-zinc-950">Đầu ra, cách dùng và giới hạn</p>
                        </div>
                        <dl className="mt-2 space-y-2.5">
                            <div><dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Đầu ra</dt><dd className="mt-0.5 text-[11px] leading-5 text-zinc-600">Tối đa 60 sản phẩm kèm similarity/rawScore, modelVersion và anchor có trọng số cao nhất trong ngữ cảnh. contentHash của Qdrant được dùng để xác thực trước; anchor là metadata chung, không phải lý do riêng cho từng món.</dd></div>
                            <div><dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Fallback</dt><dd className="mt-0.5 text-[11px] leading-5 text-zinc-600">Tắt <code className="font-mono text-[10px]">CANDIDATE_PIPELINE_V3_ENABLED</code>/<code className="font-mono text-[10px]">SEMANTIC_CANDIDATES_ENABLED</code>, thiếu vector tương thích, Qdrant lỗi hoặc nội dung đã đổi thì source trả rỗng; các nguồn khác vẫn chạy.</dd></div>
                            <div><dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Đánh đổi</dt><dd className="mt-0.5 text-[11px] leading-5 text-zinc-600">Nội dung gần nghĩa không đồng nghĩa có ý định mua. Anchor chính chỉ mô tả tâm vector chung, không phải lời giải thích riêng cho từng kết quả.</dd></div>
                        </dl>
                    </article>
                    </div>
                </section>

            </div>
        </RecommendationDisclosure>
    );
}
