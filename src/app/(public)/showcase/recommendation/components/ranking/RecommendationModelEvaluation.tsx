// Tài liệu hóa cách đo chất lượng ranking offline bằng dataset synthetic hiện tại.
// Component chỉ trình bày khái niệm, công thức và kết quả đã có; không chạy evaluator,
// không gọi AI Service và không biến số liệu synthetic thành bằng chứng về người dùng thật.
import {
    ArrowRight,
    CheckCircle2,
    Database,
    Gauge,
    Scale,
    ShieldCheck,
    TrendingUp,
} from 'lucide-react';
import { ShowcaseNote } from '../../../components/shared/ShowcaseNote';
import { RecommendationDisclosure } from '../shared/RecommendationDisclosure';
import { RecommendationStepHeader } from '../shared/RecommendationStepHeader';

// Giúp người đọc đi từ câu hỏi “model có chạy không?” đến câu hỏi quan trọng hơn:
// “model có xếp đúng sản phẩm trong cùng một request không?”. Các bước được trình bày
// theo đúng thứ tự pipeline offline: tạo dữ liệu, chia tập, dự đoán, tính metric rồi so sánh.
export function RecommendationModelEvaluation() {
    return (
        <RecommendationDisclosure
            id="recommendation-ranking-evaluation"
            number="2.2.4"
            title="Đo chất lượng AI Ranking như thế nào?"
            description="Không chỉ kiểm tra model có trả score hay không; hệ thống còn đo model có đưa sản phẩm phù hợp lên đầu danh sách, dự đoán xác suất có đáng tin và có tốt hơn Standard Ranking trên cùng dữ liệu hay không."
            level={4}
            variant="flow"
        >
            <div className="space-y-4">
                <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                    <header className="border-b border-zinc-100 pb-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                            01 · TỔNG QUAN 5 BƯỚC
                        </p>
                        <h5 className="mt-1 text-sm font-semibold text-zinc-950">
                            Từ dữ liệu đến quyết định model
                        </h5>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Năm ô bên dưới giúp đọc nhanh pipeline; các phần tiếp
                            theo sẽ giải thích chi tiết từng bước và kết quả.
                        </p>
                    </header>

                    <ol className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                        <li className="min-w-0">
                            <div className="h-full rounded-xl border border-zinc-200 bg-white p-3">
                                <RecommendationStepHeader
                                    number="01"
                                    eyebrow="Input · tạo dữ liệu"
                                    title="Sinh request và label"
                                    titleLevel={5}
                                    showDivider={false}
                                />
                                <p className="mt-3 border-t border-zinc-100 pt-3 text-[11px] leading-5 text-zinc-600">
                                    Gắn 9 feature và label 0/1 cho từng candidate.
                                </p>
                            </div>
                        </li>
                        <li className="min-w-0">
                            <div className="h-full rounded-xl border border-zinc-200 bg-white p-3">
                                <RecommendationStepHeader
                                    number="02"
                                    eyebrow="Split · chống leakage"
                                    title="Chia theo session"
                                    titleLevel={5}
                                    showDivider={false}
                                />
                                <p className="mt-3 border-t border-zinc-100 pt-3 text-[11px] leading-5 text-zinc-600">
                                    70% train · 15% validation · 15% test.
                                </p>
                            </div>
                        </li>
                        <li className="min-w-0">
                            <div className="h-full rounded-xl border border-zinc-200 bg-white p-3">
                                <RecommendationStepHeader
                                    number="03"
                                    eyebrow="Train · LightGBM"
                                    title="Cho model học"
                                    titleLevel={5}
                                    showDivider={false}
                                />
                                <p className="mt-3 border-t border-zinc-100 pt-3 text-[11px] leading-5 text-zinc-600">
                                    Validation dùng early stopping; test giữ riêng.
                                </p>
                            </div>
                        </li>
                        <li className="min-w-0">
                            <div className="h-full rounded-xl border border-zinc-200 bg-white p-3">
                                <RecommendationStepHeader
                                    number="04"
                                    eyebrow="Evaluate · tính metric"
                                    title="Đo chất lượng dự đoán"
                                    titleLevel={5}
                                    showDivider={false}
                                />
                                <p className="mt-3 border-t border-zinc-100 pt-3 text-[11px] leading-5 text-zinc-600">
                                    LogLoss · AUC · NDCG@5/10 · MRR.
                                </p>
                            </div>
                        </li>
                        <li className="min-w-0">
                            <div className="h-full rounded-xl border border-zinc-200 bg-white p-3">
                                <RecommendationStepHeader
                                    number="05"
                                    eyebrow="Decision · serving"
                                    title="Chọn model phục vụ"
                                    titleLevel={5}
                                    showDivider={false}
                                />
                                <p className="mt-3 border-t border-zinc-100 pt-3 text-[11px] leading-5 text-zinc-600">
                                    Blend 70% Standard + 30% AI; lỗi thì fallback Standard.
                                </p>
                            </div>
                        </li>
                    </ol>
                </section>

                <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                    <header className="border-b border-zinc-100 pb-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                            02 · DỮ LIỆU ĐÁNH GIÁ
                        </p>
                        <h5 className="mt-1 text-sm font-semibold text-zinc-950">
                            Một dòng dữ liệu đang đại diện cho điều gì?
                        </h5>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Simulator tạo persona, session và candidate từ catalog
                            bằng seed cố định. Đơn vị đánh giá không phải là một
                            sản phẩm đứng một mình, mà là một candidate nằm trong
                            một request recommendation của một session.
                        </p>
                    </header>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                            <div className="flex items-start gap-3">
                                <Database
                                    className="mt-0.5 size-4 shrink-0 text-zinc-700"
                                    aria-hidden="true"
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-zinc-950">
                                        Candidate và request
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-zinc-600">
                                        Một request có nhiều sản phẩm được đưa ra
                                        cùng lúc.{' '}
                                        <code className="font-mono">requestId</code>{' '}
                                        gom chúng thành một nhóm để đo thứ tự
                                        top-K.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                            <div className="flex items-start gap-3">
                                <Scale
                                    className="mt-0.5 size-4 shrink-0 text-zinc-700"
                                    aria-hidden="true"
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-zinc-950">
                                        Feature và label
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-zinc-600">
                                        <code className="font-mono">features</code>{' '}
                                        có đúng 9 số trong khoảng 0–1.{' '}
                                        <code className="font-mono">label=1</code>{' '}
                                        là có click, thêm giỏ hoặc mua;{' '}
                                        <code className="font-mono">label=0</code>{' '}
                                        là impression nhưng không có hành động tích
                                        cực.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                            <div className="flex items-start gap-3">
                                <ShieldCheck
                                    className="mt-0.5 size-4 shrink-0 text-zinc-700"
                                    aria-hidden="true"
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-zinc-950">
                                        Không làm bẩn dữ liệu thật
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-zinc-600">
                                        Simulator chỉ ghi file offline, không
                                        publish Kafka, không tạo profile giả và
                                        không ghi event vào database nghiệp vụ.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200">
                        <table className="min-w-[620px] w-full border-collapse text-left text-[11px] leading-5">
                            <caption className="sr-only">
                                Quy mô dataset synthetic dùng để đánh giá model
                            </caption>
                            <thead className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                <tr>
                                    <th className="px-3 py-2.5">Thành phần</th>
                                    <th className="px-3 py-2.5">Số lượng</th>
                                    <th className="px-3 py-2.5">Ý nghĩa</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-zinc-600">
                                <tr>
                                    <td className="px-3 py-2.5 font-semibold text-zinc-900">
                                        User giả lập
                                    </td>
                                    <td className="px-3 py-2.5 font-mono">1.000</td>
                                    <td className="px-3 py-2.5">
                                        Persona khác nhau về danh mục, thương hiệu
                                        và độ nhạy giá.
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2.5 font-semibold text-zinc-900">
                                        Session
                                    </td>
                                    <td className="px-3 py-2.5 font-mono">5.000</td>
                                    <td className="px-3 py-2.5">
                                        Một phiên mua sắm có context và candidate
                                        riêng.
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2.5 font-semibold text-zinc-900">
                                        Event
                                    </td>
                                    <td className="px-3 py-2.5 font-mono">115.700</td>
                                    <td className="px-3 py-2.5">
                                        Impression và các hành động tích cực được
                                        sinh theo persona, vị trí và nhiễu có kiểm
                                        soát.
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2.5 font-semibold text-zinc-900">
                                        Ranking rows
                                    </td>
                                    <td className="px-3 py-2.5 font-mono">69.150</td>
                                    <td className="px-3 py-2.5">
                                        Dòng feature/label thực sự đi vào train và
                                        evaluate.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                    <header className="border-b border-zinc-100 pb-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                            03 · CHIA TẬP KHÔNG RÒ RỈ DỮ LIỆU
                        </p>
                        <h5 className="mt-1 text-sm font-semibold text-zinc-950">
                            Vì sao chia theo session chứ không bốc ngẫu nhiên từng dòng?
                        </h5>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Nếu các candidate của cùng một session bị tách sang
                            nhiều tập, model có thể nhìn thấy gần như cùng một
                            context ở train rồi được chấm trên context đó ở test.
                            Kết quả sẽ đẹp giả tạo vì bị data leakage.
                        </p>
                    </header>

                    <div className="mt-4 mb-4 grid gap-3 md:grid-cols-3">
                        <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                70% · TRAIN
                            </p>
                            <p className="mt-2 text-lg font-semibold text-zinc-950">
                                3.500 session
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                Dùng để model học mối quan hệ giữa 9 feature và
                                label.
                            </p>
                            <p className="mt-2 font-mono text-[11px] text-zinc-500">
                                48.408 rows
                            </p>
                        </div>
                        <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                15% · VALIDATION
                            </p>
                            <p className="mt-2 text-lg font-semibold text-zinc-950">
                                750 session
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                Dùng để theo dõi chất lượng trong lúc train và chọn
                                vòng lặp tốt nhất, không dùng để báo cáo cuối.
                            </p>
                            <p className="mt-2 font-mono text-[11px] text-zinc-500">
                                10.364 rows
                            </p>
                        </div>
                        <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                15% · TEST
                            </p>
                            <p className="mt-2 text-lg font-semibold text-zinc-950">
                                750 session
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                Chỉ mở ra một lần ở cuối để trả lời model có tổng
                                quát được context chưa từng thấy hay không.
                            </p>
                            <p className="mt-2 font-mono text-[11px] text-zinc-500">
                                10.378 rows
                            </p>
                        </div>
                    </div>

                    <ShowcaseNote
                        title="Vì sao số row không đúng 70% / 15% / 15%?"
                        tone="white"
                        compact
                    >
                        <p>
                            Tỷ lệ 70/15/15 được áp dụng cho <strong>session</strong>,
                            không áp dụng trực tiếp cho row. Mỗi session có số
                            candidate và event khác nhau, nên số ranking rows là
                            48.408 / 10.364 / 10.378. Đây là hành vi đúng và giúp
                            giữ nguyên ranh giới request.
                        </p>
                    </ShowcaseNote>
                </section>

                <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                    <header className="border-b border-zinc-100 pb-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                            04 · HUẤN LUYỆN MODEL
                        </p>
                        <h5 className="mt-1 text-sm font-semibold text-zinc-950">
                            LightGBM học từ train và được kiểm soát bằng validation
                        </h5>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Đây là bước biến các dòng feature/label thành artifact
                            model. Test vẫn được giữ kín để đánh giá sau cùng.
                        </p>
                    </header>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                            <p className="text-sm font-semibold text-zinc-950">
                                Train set để model học
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                LightGBM đọc 9 feature và label 0/1 trong 48.408
                                rows train để học candidate nào có xu hướng tích
                                cực hơn.
                            </p>
                        </div>
                        <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                            <p className="text-sm font-semibold text-zinc-950">
                                Validation để dừng đúng lúc
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                Sau mỗi vòng học, model được kiểm tra trên 10.364
                                validation rows. Early stopping dừng khi kết quả
                                không cải thiện thêm, hạn chế overfitting.
                            </p>
                        </div>
                        <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                            <p className="text-sm font-semibold text-zinc-950">
                                Lưu artifact và metadata
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                <code className="font-mono text-[11px]">
                                    lightgbm_trainer.py
                                </code>{' '}
                                ghi model, version, seed, số row và metric cạnh
                                artifact để AI Service load đúng schema 9 feature.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                    <header className="border-b border-zinc-100 pb-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                            05 · CÁC METRIC ĐƯỢC DÙNG
                        </p>
                        <h5 className="mt-1 text-sm font-semibold text-zinc-950">
                            Mỗi metric trả lời một câu hỏi khác nhau
                        </h5>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Không có một con số duy nhất mô tả đầy đủ chất lượng
                            recommendation. Vì vậy evaluator kết hợp metric về
                            xác suất với metric về thứ tự hiển thị.
                        </p>
                    </header>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_10px_30px_-28px_rgba(24,24,27,0.5)]">
                            <div className="flex items-center gap-2">
                                <Gauge className="size-4 text-zinc-700" aria-hidden="true" />
                                <h6 className="text-sm font-semibold text-zinc-950">
                                    LogLoss · càng thấp càng tốt
                                </h6>
                            </div>
                            <div className="mt-3 space-y-2 text-xs leading-5 text-zinc-600">
                                <p>
                                    <strong className="text-zinc-950">Là gì?</strong>{' '}
                                    LogLoss đo mức độ score của model giống xác suất
                                    hành động thật đến đâu.
                                </p>
                                <p>
                                    <strong className="text-zinc-950">Vì sao dùng?</strong>{' '}
                                    Để phát hiện model dự đoán sai nhưng lại quá tự tin.
                                    LogLoss càng thấp thì score càng đáng tin.
                                </p>
                                <p>
                                    <strong className="text-zinc-950">Ví dụ:</strong>{' '}
                                    label = 1 thì dự đoán 0,9 tốt hơn 0,6; label = 0
                                    nhưng dự đoán 0,99 sẽ bị phạt rất nặng.
                                </p>
                            </div>
                            <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 font-mono text-[11px] text-zinc-700">
                                -[y·log(p) + (1-y)·log(1-p)]
                            </p>
                        </div>
                        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_10px_30px_-28px_rgba(24,24,27,0.5)]">
                            <div className="flex items-center gap-2">
                                <Scale className="size-4 text-zinc-700" aria-hidden="true" />
                                <h6 className="text-sm font-semibold text-zinc-950">
                                    AUC · càng cao càng tốt
                                </h6>
                            </div>
                            <div className="mt-3 space-y-2 text-xs leading-5 text-zinc-600">
                                <p>
                                    <strong className="text-zinc-950">Là gì?</strong>{' '}
                                    AUC đo khả năng model xếp candidate tích cực cao
                                    hơn candidate tiêu cực.
                                </p>
                                <p>
                                    <strong className="text-zinc-950">Vì sao dùng?</strong>{' '}
                                    Để biết model có phân biệt được sản phẩm nên được
                                    quan tâm hay không, không phụ thuộc một ngưỡng score.
                                </p>
                                <p>
                                    <strong className="text-zinc-950">Cách đọc:</strong>{' '}
                                    AUC = 0,5 gần như đoán ngẫu nhiên; AUC = 1,0 là
                                    phân biệt hoàn hảo.
                                </p>
                            </div>
                            <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 font-mono text-[11px] text-zinc-700">
                                P(score positive &gt; score negative)
                            </p>
                        </div>
                        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_10px_30px_-28px_rgba(24,24,27,0.5)]">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="size-4 text-zinc-700" aria-hidden="true" />
                                <h6 className="text-sm font-semibold text-zinc-950">
                                    NDCG@5 và NDCG@10 · càng cao càng tốt
                                </h6>
                            </div>
                            <div className="mt-3 space-y-2 text-xs leading-5 text-zinc-600">
                                <p>
                                    <strong className="text-zinc-950">Là gì?</strong>{' '}
                                    NDCG đo chất lượng thứ tự trong top 5 hoặc top 10
                                    của từng request.
                                </p>
                                <p>
                                    <strong className="text-zinc-950">Vì sao dùng?</strong>{' '}
                                    Người dùng thường chỉ nhìn vài sản phẩm đầu, nên
                                    sản phẩm tích cực càng gần đầu càng được tính điểm
                                    cao.
                                </p>
                                <p>
                                    <strong className="text-zinc-950">Cách đọc:</strong>{' '}
                                    NDCG so sánh thứ tự model tạo ra với thứ tự lý
                                    tưởng; điểm càng gần 1 càng tốt.
                                </p>
                            </div>
                            <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 font-mono text-[11px] text-zinc-700">
                                NDCG = DCG của model / DCG lý tưởng
                            </p>
                        </div>
                        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_10px_30px_-28px_rgba(24,24,27,0.5)]">
                            <div className="flex items-center gap-2">
                                <ArrowRight className="size-4 text-zinc-700" aria-hidden="true" />
                                <h6 className="text-sm font-semibold text-zinc-950">
                                    MRR · càng cao càng tốt
                                </h6>
                            </div>
                            <div className="mt-3 space-y-2 text-xs leading-5 text-zinc-600">
                                <p>
                                    <strong className="text-zinc-950">Là gì?</strong>{' '}
                                    MRR đo vị trí của candidate tích cực đầu tiên
                                    trong mỗi request.
                                </p>
                                <p>
                                    <strong className="text-zinc-950">Vì sao dùng?</strong>{' '}
                                    Để biết người dùng có gặp một lựa chọn tốt sớm
                                    hay phải cuộn qua nhiều sản phẩm không phù hợp.
                                </p>
                                <p>
                                    <strong className="text-zinc-950">Ví dụ:</strong>{' '}
                                    sản phẩm tốt ở vị trí 1 được 1 điểm, vị trí 2 là
                                    0,5, vị trí 3 là 0,333.
                                </p>
                            </div>
                            <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 font-mono text-[11px] text-zinc-700">
                                MRR = trung bình(1 / vị trí positive đầu tiên)
                            </p>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                    <header className="border-b border-zinc-100 pb-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                            06 · KẾT QUẢ PILOT THỰC TẾ
                                </p>
                                <h5 className="mt-1 text-sm font-semibold text-zinc-950">
                                    So sánh trên cùng 10.378 test rows
                                </h5>
                            </div>
                            <span className="w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[10px] text-zinc-500">
                                ranking-lgbm-synthetic-v1-full
                            </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-zinc-600">
                            Ba cách xếp hạng nhận cùng feature, cùng label và cùng
                            request group trên 10.378 candidate rows thuộc 750 session
                            test. LogLoss càng thấp càng tốt; AUC, NDCG và MRR càng cao
                            càng tốt. Standard là mốc so sánh; AI Ranking là score raw
                            từ LightGBM; AI-Enhanced là cách production đang dùng với
                            blend λ = 0,3.
                        </p>
                    </header>

                    <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200">
                        <table className="min-w-[760px] w-full border-collapse text-left text-[11px] leading-5">
                            <caption className="sr-only">
                                Kết quả đánh giá Standard Ranking, AI Ranking và
                                AI-Enhanced Ranking trên tập test
                            </caption>
                            <thead className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                <tr>
                                    <th className="px-3 py-2.5">Cách xếp hạng</th>
                                    <th className="px-3 py-2.5">LogLoss ↓</th>
                                    <th className="px-3 py-2.5">AUC ↑</th>
                                    <th className="px-3 py-2.5">NDCG@5 ↑</th>
                                    <th className="px-3 py-2.5">NDCG@10 ↑</th>
                                    <th className="px-3 py-2.5">MRR ↑</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-zinc-600">
                                <tr>
                                    <td className="px-3 py-2.5 font-semibold text-zinc-900">
                                        Standard Ranking
                                    </td>
                                    <td className="px-3 py-2.5 font-mono">0,6151</td>
                                    <td className="px-3 py-2.5 font-mono">0,6169</td>
                                    <td className="px-3 py-2.5 font-mono">0,4896</td>
                                    <td className="px-3 py-2.5 font-mono">0,6315</td>
                                    <td className="px-3 py-2.5 font-mono">0,6563</td>
                                </tr>
                                <tr className="bg-zinc-50/70">
                                    <td className="px-3 py-2.5 font-semibold text-zinc-900">
                                        AI Ranking · raw model
                                    </td>
                                    <td className="px-3 py-2.5 font-mono">0,5805</td>
                                    <td className="px-3 py-2.5 font-mono">0,6261</td>
                                    <td className="px-3 py-2.5 font-mono">0,4926</td>
                                    <td className="px-3 py-2.5 font-mono">0,6356</td>
                                    <td className="px-3 py-2.5 font-mono">0,6554</td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2.5 font-semibold text-zinc-900">
                                        AI-Enhanced · serving
                                    </td>
                                    <td className="px-3 py-2.5 font-mono">0,5962</td>
                                    <td className="px-3 py-2.5 font-mono">0,6200</td>
                                    <td className="px-3 py-2.5 font-mono">0,4883</td>
                                    <td className="px-3 py-2.5 font-mono">0,6329</td>
                                    <td className="px-3 py-2.5 font-mono">0,6578</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
                        <p className="text-sm font-semibold text-zinc-950">
                            Cách đọc các con số
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Mỗi số nằm trong khoảng 0 đến 1 nhưng không phải đều là
                            phần trăm chính xác. Hãy đọc từng cột theo đúng câu hỏi mà
                            metric đó trả lời, rồi so sánh với Standard ở cùng một cột.
                            Chênh lệch dưới đây là chênh lệch tuyệt đối trên thang điểm
                            0–1.
                        </p>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                01 · LOGLOSS
                            </p>
                            <h6 className="mt-1 text-sm font-semibold text-zinc-950">
                                Score có đáng tin không?
                            </h6>
                            <p className="mt-2 text-xs leading-5 text-zinc-600">
                                Standard đạt 0,6151. AI raw giảm còn 0,5805, tốt hơn
                                0,0346; AI-Enhanced đạt 0,5962, tốt hơn Standard
                                0,0189. Nghĩa là AI dự đoán label 0/1 sát hơn và ít
                                tự tin sai hơn, nhưng blend 30% chỉ đưa một phần cải
                                thiện vào serving.
                            </p>
                            <p className="mt-2 text-xs leading-5 text-zinc-600">
                                <strong className="text-zinc-950">Kết luận:</strong>{' '}
                                càng thấp càng tốt; không đọc 0,5962 thành “sai
                                59,62%” vì đây là điểm phạt xác suất.
                            </p>
                        </div>

                        <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                02 · AUC
                            </p>
                            <h6 className="mt-1 text-sm font-semibold text-zinc-950">
                                Có phân biệt được sản phẩm tốt không?
                            </h6>
                            <p className="mt-2 text-xs leading-5 text-zinc-600">
                                Standard là 0,6169. AI raw tăng lên 0,6261, hơn 0,0092;
                                AI-Enhanced là 0,6200, hơn 0,0031. Có thể hiểu 0,6200
                                là trong một cặp gồm một candidate tích cực và một
                                candidate tiêu cực, model có khoảng 62,00% khả năng
                                xếp candidate tích cực cao hơn.
                            </p>
                            <p className="mt-2 text-xs leading-5 text-zinc-600">
                                <strong className="text-zinc-950">Kết luận:</strong>{' '}
                                cả hai phiên bản AI tốt hơn mốc ngẫu nhiên 0,5; AI raw
                                phân biệt tốt nhất trong pilot.
                            </p>
                        </div>

                        <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                03 · NDCG@5
                            </p>
                            <h6 className="mt-1 text-sm font-semibold text-zinc-950">
                                Top 5 có đúng thứ tự không?
                            </h6>
                            <p className="mt-2 text-xs leading-5 text-zinc-600">
                                Standard đạt 0,4896. AI raw tăng nhẹ lên 0,4926, hơn
                                0,0030; AI-Enhanced giảm còn 0,4883, thấp hơn 0,0013.
                                Metric này ưu tiên candidate tích cực nằm càng gần 5 vị
                                trí đầu càng tốt, vì đây là phần người dùng dễ nhìn thấy
                                nhất.
                            </p>
                            <p className="mt-2 text-xs leading-5 text-zinc-600">
                                <strong className="text-zinc-950">Kết luận:</strong>{' '}
                                AI raw nhỉnh hơn rất nhỏ, còn blend hiện chưa cải thiện
                                top 5 so với Standard.
                            </p>
                        </div>

                        <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                04 · NDCG@10
                            </p>
                            <h6 className="mt-1 text-sm font-semibold text-zinc-950">
                                Top 10 có hữu ích hơn không?
                            </h6>
                            <p className="mt-2 text-xs leading-5 text-zinc-600">
                                Standard đạt 0,6315. AI raw tăng lên 0,6356, hơn 0,0041;
                                AI-Enhanced đạt 0,6329, hơn 0,0014. So với NDCG@5,
                                phạm vi top 10 cho thấy AI sắp xếp tốt hơn khi người dùng
                                xem rộng hơn danh sách ban đầu.
                            </p>
                            <p className="mt-2 text-xs leading-5 text-zinc-600">
                                <strong className="text-zinc-950">Kết luận:</strong>{' '}
                                đây là tín hiệu tích cực rõ nhất của ranking AI về chất
                                lượng thứ tự hiển thị.
                            </p>
                        </div>

                        <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                05 · MRR
                            </p>
                            <h6 className="mt-1 text-sm font-semibold text-zinc-950">
                                Candidate tốt đầu tiên xuất hiện sớm không?
                            </h6>
                            <p className="mt-2 text-xs leading-5 text-zinc-600">
                                Standard đạt 0,6563. AI raw giảm rất nhẹ còn 0,6554,
                                thấp hơn 0,0009; AI-Enhanced tăng lên 0,6578, cao hơn
                                0,0015. MRR tính 1 chia cho vị trí của candidate tích
                                cực đầu tiên, nên vị trí 1 được điểm 1, vị trí 2 được
                                0,5 và vị trí 3 được khoảng 0,333.
                            </p>
                            <p className="mt-2 text-xs leading-5 text-zinc-600">
                                <strong className="text-zinc-950">Kết luận:</strong>{' '}
                                bản serving AI-Enhanced đưa candidate tích cực đầu tiên
                                lên sớm hơn một chút so với Standard.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                            <p className="text-sm font-semibold text-zinc-950">
                                AI raw cải thiện phân biệt
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                AUC tăng từ 0,6169 lên 0,6261 và NDCG@10 tăng từ
                                0,6315 lên 0,6356 so với Standard. Nghĩa là model
                                học được tín hiệu bổ sung để nhận diện candidate
                                tích cực tốt hơn trên pilot.
                            </p>
                        </div>
                        <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                            <p className="text-sm font-semibold text-zinc-950">
                                Blend giữ an toàn cho production
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                AI-Enhanced không để AI thay Standard hoàn toàn.
                                Điểm cuối là 70% Standard + 30% AI, nên ảnh hưởng
                                của model được giới hạn và có thể fallback khi AI
                                lỗi.
                            </p>
                        </div>
                        <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                            <p className="text-sm font-semibold text-zinc-950">
                                Đọc cả metric, không chọn một số duy nhất
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                AI-Enhanced có MRR 0,6578, nhỉnh hơn Standard
                                0,6563, nhưng NDCG@5 thấp hơn một chút. Đây là lý
                                do cần nhìn nhiều metric và kiểm tra thêm bằng
                                A/B test khi có người dùng thật.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                    <header className="border-b border-zinc-100 pb-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                            07 · BẠN ĐÃ CHỨNG MINH ĐƯỢC GÌ?
                        </p>
                        <h5 className="mt-1 text-sm font-semibold text-zinc-950">
                            Demo đã chứng minh hệ thống recommendation hoạt động
                        </h5>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Kết quả hiện tại cho thấy hệ thống đã đi được trọn vẹn từ
                            catalog đến danh sách sản phẩm cuối cùng: tạo dữ liệu,
                            huấn luyện model, so sánh chất lượng và đưa model vào
                            serving. Phần cần hiểu đúng là dữ liệu hành vi đang được
                            mô phỏng, nên đây là bằng chứng cho khả năng hoạt động của
                            hệ thống, chưa phải cam kết về CTR hay doanh thu.
                        </p>
                    </header>

                    <ul className="mt-4 grid gap-3 md:grid-cols-2">
                        <li className="flex gap-2 rounded-xl border border-zinc-200 bg-white p-3.5 text-xs leading-5 text-zinc-600">
                            <CheckCircle2
                                aria-hidden="true"
                                className="mt-0.5 size-4 shrink-0 text-zinc-700"
                            />
                            <span>
                                <strong className="text-zinc-950">
                                    Đã kiểm tra được toàn bộ pipeline:
                                </strong>{' '}
                                catalog tạo candidate, RankingFeatureService tạo 9
                                feature, LightGBM chấm điểm, evaluator tính metric và
                                AI Service trả về kết quả. Khi AI lỗi, hệ thống quay về
                                Standard thay vì làm hỏng recommendation.
                            </span>
                        </li>
                        <li className="flex gap-2 rounded-xl border border-zinc-200 bg-white p-3.5 text-xs leading-5 text-zinc-600">
                            <CheckCircle2
                                aria-hidden="true"
                                className="mt-0.5 size-4 shrink-0 text-zinc-700"
                            />
                            <span>
                                <strong className="text-zinc-950">
                                    Số liệu lấy từ dữ liệu mô phỏng:
                                </strong>{' '}
                                simulator tạo persona, session, impression, click,
                                add-to-cart và purchase bằng seed cố định. Vì vậy có thể
                                chạy lại để kiểm tra, nhưng label chưa đại diện hoàn toàn
                                cho sở thích và hành vi của người mua thật.
                            </span>
                        </li>
                        <li className="flex gap-2 rounded-xl border border-zinc-200 bg-white p-3.5 text-xs leading-5 text-zinc-600">
                            <CheckCircle2
                                aria-hidden="true"
                                className="mt-0.5 size-4 shrink-0 text-zinc-700"
                            />
                            <span>
                                <strong className="text-zinc-950">
                                    Kết quả hiện tại nói được điều gì?
                                </strong>{' '}
                                AI raw đã học được tín hiệu bổ sung so với Standard;
                                AI-Enhanced dùng 30% AI và 70% Standard để đưa tín hiệu
                                đó vào serving một cách có kiểm soát. Mức cải thiện hiện
                                tại phù hợp để demo và kiểm chứng pipeline.
                            </span>
                        </li>
                        <li className="flex gap-2 rounded-xl border border-zinc-200 bg-white p-3.5 text-xs leading-5 text-zinc-600">
                            <CheckCircle2
                                aria-hidden="true"
                                className="mt-0.5 size-4 shrink-0 text-zinc-700"
                            />
                            <span>
                                <strong className="text-zinc-950">
                                    Muốn kết luận cho người dùng thật:
                                </strong>{' '}
                                cần ghi impression, click, add-to-cart và order từ
                                traffic thật; sau đó so sánh Standard với AI bằng
                                offline evaluation và A/B test, đồng thời theo dõi CTR,
                                conversion, doanh thu và tỷ lệ fallback.
                            </span>
                        </li>
                    </ul>

                    <ShowcaseNote title="Cách trình bày trong portfolio" compact className="mt-4">
                        <p>
                            “Đây là prototype recommendation có pipeline offline hoàn
                            chỉnh. Hệ thống dùng dữ liệu hành vi mô phỏng để huấn luyện
                            và đánh giá Standard Ranking, AI Ranking và AI-Enhanced trên
                            cùng một test set. Kết quả cho thấy AI đã học được tín hiệu
                            bổ sung và có thể đưa vào serving qua blend 30% với fallback
                            an toàn. Vì chưa có traffic thật, demo chưa kết luận về CTR,
                            tỷ lệ mua hàng hoặc doanh thu.”
                        </p>
                    </ShowcaseNote>
                </section>
            </div>
        </RecommendationDisclosure>
    );
}
