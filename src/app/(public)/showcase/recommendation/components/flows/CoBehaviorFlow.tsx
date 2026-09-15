// Trình bày cách event lịch sử được chiếu thành quan hệ sản phẩm rồi truy vấn thành candidate.
// Component giải thích read model co-behavior và scoring; không tự đọc event, ghi quan hệ hoặc quyết định thứ hạng.

import { ArrowRight, Database } from 'lucide-react';
import { RecommendationDisclosure } from '../shared/RecommendationDisclosure';
import { RecommendationStepHeader } from '../shared/RecommendationStepHeader';

// Mô tả cả hai nửa của co-behavior: tạo quan hệ bất đồng bộ và truy vấn có giới hạn trong request.
// Các cửa sổ thời gian, loại event, công thức decay và ngưỡng đầu ra được đối chiếu với service/repository hiện tại.
// Quan hệ là tín hiệu đồng xuất hiện, không chứng minh quan hệ nhân quả hay ý định mua của từng người.
export function CoBehaviorFlow() {
    return (
        <RecommendationDisclosure
            id="recommendation-cobehavior-flow-title"
            number="2.1.3.4"
            title="Tìm món có quan hệ từ hành vi xem, thêm giỏ và mua cùng"
            description="Dùng khi nội dung catalog chưa đủ để nhận ra hai món thường được quan tâm cùng nhau. Quan hệ được tính trước từ event/order; request chỉ đọc read model đã tổng hợp."
            level={5}
            variant="flow"
        >
            <div className="space-y-3">
                <div className="flex flex-wrap justify-end gap-1.5">
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[10px] font-medium text-zinc-600">PostgreSQL read model</span>
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[10px] font-medium text-zinc-600">Top 100</span>
                </div>
                <section className="rounded-xl border border-zinc-200 bg-white p-3" aria-label="Cách dữ liệu hành vi tạo quan hệ sản phẩm">
                    <RecommendationStepHeader number="01" eyebrow="Giai đoạn A · chiếu dữ liệu bất đồng bộ" title="Event được ghép thành cặp sản phẩm trước request gợi ý" description="Mỗi quan hệ được lưu hai chiều: A → B và B → A." titleLevel={5} />

                    <div className="mt-2 grid gap-2 lg:grid-cols-3">
                        <article className="rounded-lg border border-zinc-200 bg-white p-2.5">
                            <div className="flex items-center justify-between gap-2">
                                <code className="font-mono text-[10px] font-semibold text-zinc-700">CO_VIEW</code>
                                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-medium text-zinc-500">cùng session · 30 phút</span>
                            </div>
                            <p className="mt-2 text-[11px] font-semibold text-zinc-900">Xem, click hoặc impression gần nhau</p>
                            <p className="mt-1 text-[10px] leading-4 text-zinc-600">Ghép tối đa 20 tín hiệu <code className="font-mono text-[9px]">PRODUCT_VIEWED</code>, <code className="font-mono text-[9px]">PRODUCT_CLICKED</code>, <code className="font-mono text-[9px]">PRODUCT_IMPRESSED</code> trong cùng session. Trọng số mặc định lần lượt là 1, 2 và 0,05.</p>
                        </article>
                        <article className="rounded-lg border border-zinc-200 bg-white p-2.5">
                            <div className="flex items-center justify-between gap-2">
                                <code className="font-mono text-[10px] font-semibold text-zinc-700">CO_CART</code>
                                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-medium text-zinc-500">cùng user/session · 7 ngày</span>
                            </div>
                            <p className="mt-2 text-[11px] font-semibold text-zinc-900">Cùng được thêm vào giỏ</p>
                            <p className="mt-1 text-[10px] leading-4 text-zinc-600">Ghép tối đa 50 event <code className="font-mono text-[9px]">PRODUCT_ADDED_TO_CART</code> trong cửa sổ thời gian; trọng số mặc định là 3. Có thể nối qua user hoặc session nếu định danh tương ứng tồn tại.</p>
                        </article>
                        <article className="rounded-lg border border-zinc-200 bg-white p-2.5">
                            <div className="flex items-center justify-between gap-2">
                                <code className="font-mono text-[10px] font-semibold text-zinc-700">CO_PURCHASE</code>
                                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-medium text-zinc-500">cùng một đơn hàng</span>
                            </div>
                            <p className="mt-2 text-[11px] font-semibold text-zinc-900">Các món xuất hiện trong cùng đơn</p>
                            <p className="mt-1 text-[10px] leading-4 text-zinc-600">Tạo cặp từ các productId khác nhau trong đơn (tối đa 50 mã). Đơn hoàn tất mặc định +6; đơn trả hàng tạo hiệu chỉnh −6 để giảm quan hệ đã ghi.</p>
                        </article>
                    </div>

                    <div className="mt-2 flex flex-col gap-1 border-t border-zinc-200 pt-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                        <p className="text-[10px] leading-4 text-zinc-600">Các trọng số là default có thể cấu hình. Event ledger và pair ledger giúp retry không cộng cùng một cặp hai lần; quan hệ được giới hạn top 100 đích cho mỗi anchor/loại.</p>
                        <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-zinc-400">Event → pair → relation score</span>
                    </div>
                </section>

                <div aria-hidden="true" className="flex justify-center py-0.5"><ArrowRight className="size-4 rotate-90 text-zinc-400" /></div>

                <section className="rounded-xl border border-zinc-200 bg-white p-3" aria-label="Các bước truy vấn co-behavior trong request">
                    <RecommendationStepHeader number="02" eyebrow="Giai đoạn B · request recommendation" title="Từ tối đa 10 anchor đến tối đa 100 sản phẩm liên quan" description="Không quét lại toàn bộ lịch sử event trong mỗi request." titleLevel={5} />
                    <ol className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4" aria-label="Bốn bước truy vấn co-behavior">
                        <li className="rounded-xl border border-zinc-200 bg-white p-3">
                            <span className="grid size-6 place-items-center rounded-lg border border-zinc-200 bg-white font-mono text-[10px] font-semibold text-zinc-600">01</span>
                            <h6 className="mt-2 text-xs font-semibold text-zinc-950">Chọn anchor (món làm mốc)</h6>
                            <p className="mt-1.5 text-[11px] leading-[1.6] text-zinc-600">Gộp món đang xem, tối đa 30 product preference dương và product trong session; khử trùng rồi giữ 10 ID đầu theo thứ tự: món đang xem → hồ sơ → session.</p>
                        </li>
                        <li className="rounded-xl border border-zinc-200 bg-white p-3">
                            <span className="grid size-6 place-items-center rounded-lg border border-zinc-200 bg-white font-mono text-[10px] font-semibold text-zinc-600">02</span>
                            <h6 className="mt-2 text-xs font-semibold text-zinc-950">Đọc và làm mới điểm</h6>
                            <p className="mt-1.5 text-[11px] leading-[1.6] text-zinc-600">Tra quan hệ đi ra từ từng anchor theo CO_VIEW/CART/PURCHASE. Điểm giảm theo tuổi quan hệ; chỉ lấy effective score &gt; 0, top 100 mỗi cặp anchor/loại rồi giới hạn toàn truy vấn ở 100.</p>
                        </li>
                        <li className="rounded-xl border border-zinc-200 bg-white p-3">
                            <span className="grid size-6 place-items-center rounded-lg border border-zinc-200 bg-white font-mono text-[10px] font-semibold text-zinc-600">03</span>
                            <h6 className="mt-2 text-xs font-semibold text-zinc-950">Loại trùng, giữ bằng chứng</h6>
                            <p className="mt-1.5 text-[11px] leading-[1.6] text-zinc-600">Bỏ món trong danh sách exclude của request. Nếu một target nối từ nhiều anchor/loại quan hệ, gom thành một sản phẩm và giữ từng contribution; điểm mạnh nhất được xếp trước.</p>
                        </li>
                        <li className="rounded-xl border border-zinc-200 bg-white p-3">
                            <span className="grid size-6 place-items-center rounded-lg border border-zinc-200 bg-white font-mono text-[10px] font-semibold text-zinc-600">04</span>
                            <h6 className="mt-2 text-xs font-semibold text-zinc-950">Lấy dữ liệu Catalog</h6>
                            <p className="mt-1.5 text-[11px] leading-[1.6] text-zinc-600">Lấy (hydrate) dữ liệu Catalog cho tối đa 100 target; gắn source, anchor, relationType, rawScore và vị trí nguồn để bước ranking sử dụng.</p>
                        </li>
                    </ol>
                </section>

                <div aria-hidden="true" className="flex justify-center py-0.5"><ArrowRight className="size-4 rotate-90 text-zinc-400" /></div>

                <section className="rounded-xl border border-zinc-200 bg-white p-3" aria-label="Chuẩn hóa đầu ra co-behavior">
                    <RecommendationStepHeader number="03" eyebrow="Chuẩn hóa và bàn giao" title="Điều chỉnh quan hệ theo độ mới rồi tạo feature ranking" titleLevel={5} />
                    <div className="mt-3 grid gap-2 lg:grid-cols-[0.9fr_1.1fr]">
                    <article className="rounded-lg border border-zinc-200 bg-white p-3" aria-label="Công thức suy giảm điểm quan hệ">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Công thức · giảm ảnh hưởng của quan hệ cũ</p>
                        <p className="mt-2 break-words rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-mono text-[12px] font-semibold text-zinc-900 sm:text-sm">effective = relationScore × 0,5<sup className="text-[9px]">(age / halfLife)</sup></p>
                        <p className="mt-2 text-[11px] leading-5 text-zinc-600">Mặc định <code className="font-mono text-[10px] text-zinc-800">halfLife = 30 ngày</code>: quan hệ 30 ngày tuổi còn một nửa điểm; 60 ngày còn khoảng một phần tư. Giá trị được cấu hình bằng <code className="font-mono text-[10px] text-zinc-800">RELATION_SCORE_HALF_LIFE_DAYS</code>.</p>
                        <p className="mt-2 text-[10px] leading-4 text-zinc-500">Ví dụ: relationScore 8, tuổi 30 ngày → effective score 4. Đây là ví dụ tính decay, không phải điểm cố định cho mọi cặp.</p>
                    </article>

                    <article className="rounded-lg border border-zinc-200 bg-white p-3" aria-label="Đầu ra và đánh đổi co-behavior">
                        <div className="flex items-center gap-2">
                            <Database aria-hidden="true" className="size-3.5 text-zinc-500" />
                            <p className="text-xs font-semibold text-zinc-950">Ý nghĩa đầu ra và trade-off</p>
                        </div>
                        <dl className="mt-2 grid gap-2.5 sm:grid-cols-2">
                            <div><dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Điểm mạnh</dt><dd className="mt-0.5 text-[11px] leading-5 text-zinc-600">Tìm được quan hệ bổ trợ mà text/danh mục không diễn đạt; request đọc bảng tổng hợp thay vì quét lịch sử hành vi.</dd></div>
                            <div><dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Giới hạn dữ liệu</dt><dd className="mt-0.5 text-[11px] leading-5 text-zinc-600">Sản phẩm mới dễ thiếu relation; co-view/popular item có thể phản ánh cùng phiên hoặc mức độ được hiển thị, không chứng minh khách sẽ mua hay hai món thực sự bổ trợ nhau.</dd></div>
                            <div><dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Khi thiếu dữ liệu/lỗi</dt><dd className="mt-0.5 text-[11px] leading-5 text-zinc-600">Tắt <code className="font-mono text-[10px]">CO_BEHAVIOR_CANDIDATES_ENABLED</code>, không có anchor/quan hệ hoặc query lỗi thì nguồn trả rỗng; candidate từ nguồn khác vẫn được dùng.</dd></div>
                            <div>
                                <dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Chuẩn hóa trước khi xếp hạng</dt>
                                <dd className="mt-0.5 text-[11px] leading-5 text-zinc-600">Mỗi quan hệ có <code className="font-mono text-[10px]">n = score / (score + scale[loại])</code>; <code className="font-mono text-[10px]">coBehavior = max(n)</code> qua các anchor/quan hệ của món đó. Scale mặc định: CO_VIEW 1, CO_CART 3, CO_PURCHASE 6 — không cộng mọi đường nối thành điểm phình lớn.</dd>
                            </div>
                        </dl>
                    </article>
                    </div>
                </section>

                <div className="flex flex-col gap-1 border-t border-zinc-200 px-1 py-2 text-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[11px] leading-5"><strong className="font-semibold text-zinc-950">Bàn giao sang ranking:</strong> mỗi quan hệ được chuẩn hóa thành feature theo loại (CO_VIEW/CART/PURCHASE); Standard Hybrid mặc định dành trọng số 0,10 cho coBehavior (policy có thể thay đổi).</p>
                    <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">Candidate ≠ thứ hạng</span>
                </div>
            </div>
        </RecommendationDisclosure>
    );
}
