// Trình bày luồng chấm điểm candidate và công thức Standard/AI-Enhanced trong trang showcase.
// Component chỉ giải thích, không tự tính ranking; trọng số và quy tắc hiển thị phải khớp Recommendation Service.
// Các số trong ví dụ là dữ liệu giả định, không được diễn giải thành xác suất mua hàng.
import { Scale } from 'lucide-react';
import {
    RankingWeightDetails,
} from './RankingWeightDetails';
import type { RankingWeightKey } from './RankingWeightDetails.types';
import { RecommendationDisclosure } from '../shared/RecommendationDisclosure';
import { RecommendationNumberedHeading } from '../shared/RecommendationNumberedHeading';

type ScoreFeature = {
    name: string;
    key: RankingWeightKey;
    weight: string;
    why: string;
};

const scoreFeatures: ScoreFeature[] = [
    {
        name: 'Sở thích trong hồ sơ',
        key: 'profileAffinity',
        weight: '25%',
        why: 'Ưu tiên sản phẩm, danh mục hoặc thương hiệu người mua từng quan tâm.',
    },
    {
        name: 'Nhu cầu trong phiên hiện tại',
        key: 'sessionContext',
        weight: '18%',
        why: 'Bắt kịp điều người mua đang xem trong phiên, kể cả khi khác sở thích lâu dài.',
    },
    {
        name: 'Sản phẩm tương tự về nội dung',
        key: 'semanticSimilarity',
        weight: '15%',
        why: 'Tìm thêm lựa chọn gần với sản phẩm người mua đang quan tâm, dù khác danh mục.',
    },
    {
        name: 'Sản phẩm thường đi cùng nhau',
        key: 'coBehavior',
        weight: '10%',
        why: 'Dùng hành vi của nhiều người để nhận ra các món thường được xem, thêm giỏ hoặc mua cùng nhau.',
    },
    {
        name: 'Mức độ phổ biến',
        key: 'popularity',
        weight: '12%',
        why: 'Tạo điểm tựa khi người mua chưa có nhiều dữ liệu cá nhân.',
    },
    {
        name: 'Độ mới của sản phẩm',
        key: 'freshness',
        weight: '8%',
        why: 'Dành một phần cơ hội hiển thị cho sản phẩm mới.',
    },
    {
        name: 'Chất lượng và tồn kho',
        key: 'quality',
        weight: '8%',
        why: 'Khuyến khích sản phẩm được đánh giá tốt, có đánh giá đủ tin cậy và còn hàng.',
    },
    {
        name: 'Khám phá sản phẩm mới',
        key: 'exploration',
        weight: '4%',
        why: 'Cho người ít dữ liệu cơ hội thấy sản phẩm mới hoặc được chọn từ nguồn khám phá.',
    },
];

const workedExample = [
    { name: 'Sở thích hồ sơ', score: '0,80', weight: '25%', contribution: '0,200' },
    { name: 'Phiên hiện tại', score: '0,60', weight: '18%', contribution: '0,108' },
    { name: 'Tương tự nội dung', score: '0,90', weight: '15%', contribution: '0,135' },
    { name: 'Hành vi đi cùng', score: '0,50', weight: '10%', contribution: '0,050' },
    { name: 'Phổ biến', score: '0,70', weight: '12%', contribution: '0,084' },
    { name: 'Độ mới', score: '0,55', weight: '8%', contribution: '0,044' },
    { name: 'Chất lượng', score: '0,90', weight: '8%', contribution: '0,072' },
    { name: 'Khám phá', score: '0,00', weight: '4%', contribution: '0,000' },
];

// Giải thích dữ liệu đầu vào, phép tính từng bước và phần AI chỉ bổ sung vào baseline Standard.
export function RecommendationScoring() {
    return (
        <section className="space-y-5">
            <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white" aria-label="Luồng xếp hạng sản phẩm">
                <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-4 sm:px-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Luồng xếp hạng candidate</p>
                    <p className="mt-1 text-sm leading-6 text-zinc-700">Hệ thống tính điểm theo chế độ Standard hoặc AI-Enhanced, sắp candidate theo điểm rồi áp dụng trộn nguồn cold-start (nếu có) và diversity trước khi trả danh sách.</p>
                </div>
                <div className="grid gap-px bg-zinc-200 sm:grid-cols-2 xl:grid-cols-4">
                    <article className="bg-white p-4 sm:p-5">
                        <p className="font-mono text-[10px] font-semibold tracking-widest text-zinc-400">01 · ĐẦU VÀO</p>
                        <h4 className="mt-2 text-sm font-semibold text-zinc-950">Candidate từ pool đã hợp nhất</h4>
                        <p className="mt-1.5 text-xs leading-5 text-zinc-600">Mỗi sản phẩm đi kèm dữ liệu sản phẩm, ngữ cảnh hồ sơ/phiên và thông tin nguồn đã tìm thấy.</p>
                    </article>
                    <article className="bg-white p-4 sm:p-5">
                        <p className="font-mono text-[10px] font-semibold tracking-widest text-zinc-400">02 · TẠO FEATURE</p>
                        <h4 className="mt-2 text-sm font-semibold text-zinc-950">Tạo 8 feature cho candidate</h4>
                        <p className="mt-1.5 text-xs leading-5 text-zinc-600">Feature đo mức phù hợp trong khoảng 0–1; tín hiệu không có dữ liệu hỗ trợ được tính bằng 0.</p>
                    </article>
                    <article className="bg-white p-4 sm:p-5">
                        <p className="font-mono text-[10px] font-semibold tracking-widest text-zinc-400">03 · TÍNH ĐIỂM</p>
                        <h4 className="mt-2 text-sm font-semibold text-zinc-950">Standard hoặc AI-Enhanced</h4>
                        <p className="mt-1.5 text-xs leading-5 text-zinc-600">Standard cộng feature theo trọng số rồi trừ penalty (tối đa 0,15). AI-Enhanced pha điểm Standard với dự đoán AI; thiếu điểm AI hợp lệ thì giữ Standard.</p>
                    </article>
                    <article className="bg-white p-4 sm:p-5">
                        <p className="font-mono text-[10px] font-semibold tracking-widest text-zinc-400">04 · SẮP XẾP</p>
                        <h4 className="mt-2 text-sm font-semibold text-zinc-950">Sắp thứ tự và làm đa dạng</h4>
                        <p className="mt-1.5 text-xs leading-5 text-zinc-600">Sắp điểm giảm dần; nếu là COLD_START thì trộn theo quota nguồn, sau đó diversity giới hạn lặp danh mục, thương hiệu và shop. Các bước này có thể đổi thứ tự trả về.</p>
                    </article>
                </div>
            </section>

            <RecommendationDisclosure
                id="standard-ranking-formula"
                number="2.2.1"
                title="Công thức Standard — áp dụng riêng cho từng sản phẩm"
                description="Tính một điểm cho từng candidate; sau đó sắp xếp điểm từ cao xuống thấp."
                level={4}
                variant="flow"
            >
                <div className="min-w-0 space-y-4">
                <section className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5" aria-label="Các bước tính điểm Standard">
                    <header className="mb-3 border-b border-zinc-200 pb-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Cách đọc công thức</p>
                        <h5 className="mt-1 text-sm font-semibold text-zinc-950">Mỗi ứng viên đi qua bốn bước tính điểm</h5>
                    </header>
                    <ol className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <li className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4">
                            <span className="flex size-9 flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white text-[8px] font-medium uppercase leading-none text-zinc-500">Bước<span className="mt-1 font-mono text-xs font-semibold text-zinc-900">01</span></span>
                            <h6 className="mt-2 text-xs font-semibold text-zinc-950">Tính 8 tín hiệu</h6>
                            <p className="mt-1 text-[11px] leading-4 text-zinc-600">Mỗi tín hiệu của sản phẩm được chuẩn hóa về khoảng 0–1.</p>
                        </li>
                        <li className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4">
                            <span className="flex size-9 flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white text-[8px] font-medium uppercase leading-none text-zinc-500">Bước<span className="mt-1 font-mono text-xs font-semibold text-zinc-900">02</span></span>
                            <h6 className="mt-2 text-xs font-semibold text-zinc-950">Nhân trọng số</h6>
                            <p className="mt-1 text-[11px] leading-4 text-zinc-600">Mặc định tổng trọng số là 100%; policy có thể đổi tỷ lệ và hệ thống chuẩn hóa lại.</p>
                        </li>
                        <li className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4">
                            <span className="flex size-9 flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white text-[8px] font-medium uppercase leading-none text-zinc-500">Bước<span className="mt-1 font-mono text-xs font-semibold text-zinc-900">03</span></span>
                            <h6 className="mt-2 text-xs font-semibold text-zinc-950">Trừ điểm không thích</h6>
                            <p className="mt-1 text-[11px] leading-4 text-zinc-600">Preference âm ở sản phẩm, danh mục hoặc thương hiệu giảm theo thời gian (mặc định còn nửa sau 7 ngày); penalty tối đa 0,15.</p>
                        </li>
                        <li className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4">
                            <span className="flex size-9 flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white text-[8px] font-medium uppercase leading-none text-zinc-500">Bước<span className="mt-1 font-mono text-xs font-semibold text-zinc-900">04</span></span>
                            <h6 className="mt-2 text-xs font-semibold text-zinc-950">Giới hạn và xếp thứ tự</h6>
                            <p className="mt-1 text-[11px] leading-4 text-zinc-600">Clamp về 0–1 rồi sắp điểm giảm dần; hòa điểm xét số đóng góp rồi productId. Cold-start và diversity có thể đổi thứ tự trả về.</p>
                        </li>
                    </ol>
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-zinc-100 pt-3" aria-label="Trọng số Standard mặc định">
                        <span className="mr-1 self-center text-[10px] font-semibold text-zinc-500">Trọng số mặc định:</span>
                        <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-600">Hồ sơ 25%</span>
                        <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-600">Phiên 18%</span>
                        <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-600">Ngữ nghĩa 15%</span>
                        <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-600">Hành vi 10%</span>
                        <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-600">Phổ biến 12%</span>
                        <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-600">Độ mới 8%</span>
                        <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-600">Chất lượng 8%</span>
                        <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-600">Khám phá 4%</span>
                    </div>
                </section>

                <div className="space-y-3">
                    <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Bước 1 · Tính điểm Standard</p>
                        <code className="mt-3 block overflow-x-auto rounded-xl border border-zinc-200 bg-white px-4 py-3 font-mono text-xs leading-6 text-zinc-900 sm:text-sm">
                            S_standard = clamp(Σ(featureᵢ × weightᵢ) − negativePenalty, 0, 1)
                            <br />Σ weightᵢ = 1 &nbsp;·&nbsp; 0 ≤ negativePenalty ≤ 0,15
                        </code>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                            <p className="rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-600"><strong className="text-zinc-900">Feature:</strong> độ phù hợp theo một tín hiệu; mỗi tín hiệu nằm trong khoảng 0–1.</p>
                            <p className="rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-600"><strong className="text-zinc-900">Weight:</strong> mức ảnh hưởng của tín hiệu. Tám trọng số được chuẩn hóa để tổng bằng 100%.</p>
                            <p className="rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-600"><strong className="text-zinc-900">Điểm phạt:</strong> trừ phần sở thích tiêu cực đã ghi nhận; giới hạn tối đa 0,15.</p>
                            <p className="rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-600"><strong className="text-zinc-900">Clamp:</strong> chặn điểm cuối trong khoảng 0–1, không âm hoặc vượt trần.</p>
                        </div>
                    </section>

                    <div className="space-y-3">
                      <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                        <div className="flex flex-wrap items-end justify-between gap-2">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Bước 2 · Nhân từng tín hiệu với trọng số</p>
                                <p className="mt-1 text-xs leading-5 text-zinc-600">Ví dụ minh họa theo trọng số mặc định trong code; mỗi đóng góp = điểm tín hiệu × trọng số.</p>
                            </div>
                            <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-medium text-zinc-600">8 tín hiệu · tổng trọng số 100%</span>
                        </div>
                        <div className="mt-3 overflow-x-auto rounded-2xl border border-zinc-200">
                            <div className="min-w-[600px]">
                                <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.9fr] gap-3 bg-zinc-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 sm:px-4">
                                    <span>Tín hiệu</span><span className="text-right">Điểm</span><span className="text-right">Trọng số</span><span className="text-right">Đóng góp</span>
                                </div>
                                {workedExample.map((row) => (
                                    <div key={row.name} className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.9fr] gap-3 border-t border-zinc-100 px-3 py-2.5 text-xs sm:px-4">
                                        <span className="text-zinc-700">{row.name}</span>
                                        <span className="text-right font-mono text-zinc-600">{row.score}</span>
                                        <span className="text-right font-mono text-zinc-600">{row.weight}</span>
                                        <span className="text-right font-mono font-semibold text-zinc-900">{row.contribution}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                      </section>

                        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                            <div className="rounded-2xl border border-zinc-200 bg-white p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Bước 3 · Cộng đóng góp</p>
                                <p className="mt-1 text-sm text-zinc-700">Tổng có trọng số <strong className="font-mono text-zinc-950">0,693</strong></p>
                            </div>
                            <span aria-hidden="true" className="hidden text-zinc-400 sm:block">−</span>
                            <div className="rounded-2xl border border-zinc-200 bg-white p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Bước 4 · Trừ phạt, rồi giới hạn</p>
                                <p className="mt-1 text-sm text-zinc-700"><span className="font-mono">0,693 − 0,040</span> phạt giả định = <strong className="font-mono text-zinc-950">0,653</strong> Standard</p>
                            </div>
                        </div>

                        <div className="mt-5 flex items-center gap-3">
                            <span className="h-px flex-1 bg-zinc-200" />
                            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Nếu bật AI-Enhanced · bước kế tiếp</span>
                            <span className="h-px flex-1 bg-zinc-200" />
                        </div>
                        <section className="mt-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5" aria-label="Cách AI kết hợp với điểm Standard">
                            <div className="flex items-center gap-2">
                                <Scale aria-hidden="true" className="size-4 text-zinc-700" />
                                <h5 className="text-sm font-semibold text-zinc-950">AI-Enhanced: lấy Standard làm nền, AI điều chỉnh một phần</h5>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-zinc-600">Chế độ này dùng cùng candidate và điểm Standard đã tính ở trên. Model trả thêm một điểm dự đoán cho từng sản phẩm; hệ thống chỉ kết hợp điểm đó khi AI-Enhanced được bật và có prediction hợp lệ.</p>
                            <code className="mt-3 block overflow-x-auto rounded-xl border border-zinc-200 bg-white p-3 font-mono text-xs leading-5 text-zinc-800">S_cuối = clamp(S_standard × (1 − λ) + S_AI × λ, 0, 1)</code>
                            <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-600">
                                <p><strong className="text-zinc-900">Ý nghĩa các ký hiệu:</strong> <span className="font-mono">S_standard</span> là điểm Standard đã tính; <span className="font-mono">S_AI</span> là điểm model dự đoán cho chính candidate đó; <span className="font-mono">λ</span> là tỷ lệ ảnh hưởng của AI.</p>
                                <p className="mt-1"><span className="font-mono">1 − λ</span> là phần Standard còn lại. <span className="font-mono">clamp(x, 0, 1)</span> nghĩa là nếu x nhỏ hơn 0 thì lấy 0, lớn hơn 1 thì lấy 1, còn trong khoảng thì giữ nguyên.</p>
                            </div>
                            <div className="mt-3 grid gap-2 grid-cols-1">
                                <div className="rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-600">
                                    <p className="font-semibold text-zinc-900">Bước 1 · Tính phần Standard</p>
                                    <p className="mt-1">λ mặc định là 0,3, vậy phần Standard còn lại là 1 − λ = 1 − 0,3 = 0,7 (70%). Nhân điểm Standard với tỷ lệ này:</p>
                                    <p className="mt-1 font-mono text-zinc-800">0,653 × (1 − 0,3) = 0,653 × 0,7 = 0,4571</p>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-600">
                                    <p className="font-semibold text-zinc-900">Bước 2 · Tính phần AI</p>
                                    <p className="mt-1">Nhân điểm dự đoán AI với λ. Ở mặc định λ = 0,3, AI chỉ đóng góp 30% vào điểm cuối:</p>
                                    <p className="mt-1 font-mono text-zinc-800">0,800 × 0,3 = 0,2400</p>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-600">
                                    <p className="font-semibold text-zinc-900">Bước 3 · Cộng hai phần và áp dụng clamp</p>
                                    <p className="mt-1">Cộng hai đóng góp. Kết quả 0,6971 đã nằm trong 0–1 nên clamp giữ nguyên; trong ví dụ, viết gọn đến ba chữ số thập phân:</p>
                                    <p className="mt-1 font-mono font-semibold text-zinc-950">0,4571 + 0,2400 = 0,6971 → clamp = 0,6971 ≈ 0,697</p>
                                </div>
                            </div>
                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                                <p className="rounded-xl bg-white p-3 text-xs leading-5 text-zinc-600"><strong className="text-zinc-900">Cách hiểu λ:</strong> λ là tỷ lệ ảnh hưởng của AI, được cấu hình từ 0 đến tối đa 0,5. λ = 0 nghĩa là chỉ dùng Standard; λ = 0,5 nghĩa là Standard và AI có trọng số ngang nhau. Mặc định 0,3 giữ Standard làm phần chính.</p>
                                <p className="rounded-xl bg-white p-3 text-xs leading-5 text-zinc-600"><strong className="text-zinc-900">Khi AI không dùng được:</strong> nếu một sản phẩm thiếu prediction hợp lệ, riêng sản phẩm đó giữ điểm Standard. Nếu request AI lỗi hoặc timeout, toàn bộ danh sách dùng Standard để không làm gián đoạn gợi ý.</p>
                            </div>
                            <p className="mt-3 text-[11px] leading-5 text-zinc-500">Điểm cuối vẫn là điểm xếp hạng, không phải xác suất mua. λ thấp giữ kết quả gần baseline; tăng λ làm thứ hạng nhạy hơn với model và cần được kiểm chứng bằng experiment.</p>
                        </section>
                    </div>

                <p className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-xs leading-5 text-zinc-600"><strong className="text-zinc-900">Cách đọc kết quả:</strong> 0,653 là điểm dùng để so thứ tự các ứng viên trong lần gợi ý này, <strong>không phải xác suất mua 65,3%</strong>. Ví dụ là số giả định để minh họa.</p>
                </div>
                </div>
            </RecommendationDisclosure>

            <RecommendationDisclosure
                id="ranking-feature-weights"
                number="2.2.2"
                title="Tám tiêu chí xếp hạng"
                description="Xem cách tính, lý do chọn và đánh đổi của từng tiêu chí bên dưới."
                level={4}
                variant="flow"
            >
                    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white" aria-label="Hướng dẫn đọc điểm tiêu chí">
                        <header className="relative flex flex-wrap items-center justify-between gap-4 bg-white px-4 py-4 after:absolute after:inset-x-5 after:bottom-0 after:h-px after:bg-zinc-200 after:content-[''] sm:px-5 sm:after:inset-x-6">
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Hướng dẫn</p>
                                <h5 className="mt-1 text-sm font-semibold text-zinc-950">Cách đọc một tiêu chí</h5>
                                <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-600">Mỗi tiêu chí tạo một phần đóng góp vào điểm Standard; điểm feature và trọng số là hai giá trị khác nhau.</p>
                            </div>
                            <div className="flex shrink-0 flex-col gap-0.5 rounded-xl border border-zinc-200 bg-white px-3 py-2">
                                <span className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500">Cách tính đóng góp</span>
                                <span className="font-mono text-xs font-medium text-zinc-900">điểm feature × trọng số</span>
                            </div>
                        </header>
                        <div className="bg-white p-4 sm:p-5">
                            <div className="grid gap-3 md:grid-cols-3">
                                <div className="rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-600">
                                    <p className="font-semibold text-zinc-900">1. Điểm feature · 0–1</p>
                                    <p className="mt-1">Đo mức phù hợp của sản phẩm theo riêng tiêu chí này: 0 là không có tín hiệu phù hợp, 1 là mức tối đa của công thức.</p>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-600">
                                    <p className="font-semibold text-zinc-900">2. Trọng số · %</p>
                                    <p className="mt-1">Cho biết tiêu chí ảnh hưởng nhiều hay ít đến tổng điểm. Đây là cấu hình của policy, không phải mức phù hợp của sản phẩm.</p>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-600">
                                    <p className="font-semibold text-zinc-900">3. Phần đóng góp</p>
                                    <p className="mt-1">Ví dụ: 0,8 × 25% = 0,20 điểm. Hệ thống cộng đóng góp của tám tiêu chí rồi trừ penalty riêng.</p>
                                </div>
                            </div>
                            <p className="mt-4 border-t border-zinc-200 pt-3 text-[11px] leading-5 text-zinc-500">Các trọng số hiển thị bên dưới là mặc định trong code, chưa phải kết quả A/B tối ưu. Mỗi tiêu chí được tách thành một hàng để dễ xem công thức, ví dụ và đánh đổi.</p>
                        </div>
                    </section>
                <div className="mt-3 grid grid-cols-1 items-start gap-2.5">
                    {scoreFeatures.map((feature, index) => (
                        <details key={feature.key} className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                            <RecommendationNumberedHeading
                                number={`2.2.2.${index + 1}`}
                                title={feature.name}
                                description={feature.why}
                                headingId={`ranking-feature-${feature.key}`}
                                level={5}
                                variant="topic"
                                asSummary
                                compact
                                summaryAside={
                                    <span className="flex w-full flex-col items-end gap-1">
                                        <span className="flex w-full items-center gap-2">
                                            <span aria-hidden="true" className="block h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-100"><span className="block h-full rounded-full bg-zinc-700" style={{ width: feature.weight }} /></span>
                                            <span className="shrink-0 rounded-full border border-zinc-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-zinc-700">{feature.weight} · mặc định</span>
                                        </span>
                                        <span className="max-w-full text-right text-[9px] leading-3 text-zinc-500 md:whitespace-nowrap">Mở “Cách tính” để xem công thức, dữ liệu và ví dụ chi tiết</span>
                                    </span>
                                }
                                disclosureContentId={`ranking-feature-details-${feature.key}`}
                                className="bg-white p-2.5 sm:p-3"
                            />
                            <RankingWeightDetails
                                id={`ranking-feature-details-${feature.key}`}
                                signal={feature.key}
                                weightPercent={Number(feature.weight.replace('%', ''))}
                            />
                        </details>
                    ))}
                </div>
            </RecommendationDisclosure>
        </section>
    );
}
