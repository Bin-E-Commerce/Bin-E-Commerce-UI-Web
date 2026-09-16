// Panel này cho Admin chỉnh trọng số Standard, cấu hình AI và xem lịch sử policy.
// Component không tự gọi API hay thay đổi runtime; submit và rollback thuộc component cha.
// Giữ nguyên ranh giới: backend vẫn là nơi validate, normalize và audit mọi policy.

import {
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from 'react';
import {
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    CircleAlert,
    Info,
    RotateCcw,
    Save,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    RankingWeightDetails,
} from '@/app/(public)/showcase/recommendation/components/ranking/RankingWeightDetails';
import type { RankingWeightKey } from '@/app/(public)/showcase/recommendation/components/ranking/RankingWeightDetails.types';
import type {
    RecommendationAdminPolicy,
    UpdateRecommendationPolicyPayload,
} from '@/services/admin';

interface Props {
    policy: RecommendationAdminPolicy | null;
    history: RecommendationAdminPolicy[];
    loading: boolean;
    saving: boolean;
    rollbackSaving: boolean;
    onSave: (payload: UpdateRecommendationPolicyPayload) => void;
    onRollback: (version: string) => void;
}

// Format timestamp lịch sử theo locale UI; dữ liệu lỗi vẫn không làm hỏng cả panel policy.
function formatDate(value: string | null): string {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN');
}

// Chặn giá trị blend ngoài policy ngay ở UI trước khi gửi; backend vẫn là boundary validate cuối cùng.
function normalizeBlend(value: number): number {
    if (!Number.isFinite(value)) return 0.3;
    return Math.min(0.5, Math.max(0, value));
}

// Chuyển weight nội bộ dạng 0-1 thành phần trăm dễ đọc; backend vẫn nhận giá trị dạng số thập phân.
function formatWeightPercent(value: number | undefined): number {
    return Number.isFinite(value) ? Number(((value ?? 0) * 100).toFixed(2)) : 0;
}

// Tính tổng để Admin nhận biết nhanh policy hiện tại đang phân bổ đủ 100% hay chưa.
function getWeightTotalPercent(weights: Record<string, number>): number {
    return Number(
        (
            Object.values(weights).reduce((sum, value) => sum + value, 0) * 100
        ).toFixed(2),
    );
}

// Cập nhật một weight từ ô phần trăm và chặn giá trị ngoài khoảng hợp lệ ngay tại UI.
function updateWeight(
    setWeights: Dispatch<SetStateAction<Record<string, number>>>,
    key: string,
    rawPercent: string,
): void {
    const percent = Number(rawPercent);
    setWeights((current) => ({
        ...current,
        [key]: Number.isFinite(percent)
            ? Math.min(100, Math.max(0, percent)) / 100
            : 0,
    }));
}

interface WeightFieldProps {
    detailKey: RankingWeightKey;
    label: string;
    description: string;
    value: number | undefined;
    onChange: (value: string) => void;
}

// Ô trọng số nhận key/giá trị/callback của một feature, đổi phần trăm và mở phần giải thích tương ứng.
// State cục bộ chỉ điều khiển phần chi tiết; thay đổi số vẫn được giữ ở form cha cho tới khi Admin lưu.
function WeightField({
    detailKey,
    label,
    description,
    value,
    onChange,
}: WeightFieldProps) {
    const [detailsOpen, setDetailsOpen] = useState(false);

    return (
        <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-sm font-medium text-zinc-900">
                            {label}
                        </p>
                        <button
                            type="button"
                            aria-expanded={detailsOpen}
                            aria-controls={`ranking-weight-details-${detailKey}`}
                            onClick={() => setDetailsOpen((open) => !open)}
                            className="inline-flex items-center gap-1 rounded-md text-xs font-medium text-zinc-600 outline-none transition hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-400"
                        >
                            <Info className="size-3.5" aria-hidden="true" />
                            {detailsOpen ? 'Ẩn cách tính' : 'Cách tính'}
                            {detailsOpen ? (
                                <ChevronUp
                                    className="size-3.5"
                                    aria-hidden="true"
                                />
                            ) : (
                                <ChevronDown
                                    className="size-3.5"
                                    aria-hidden="true"
                                />
                            )}
                        </button>
                    </div>
                    <p className="mt-0.5 text-xs leading-5 text-zinc-500">
                        {description}
                    </p>
                </div>
                <span className="flex shrink-0 items-center gap-2">
                    <input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={formatWeightPercent(value)}
                        onChange={(event) => onChange(event.target.value)}
                        className="h-9 w-20 rounded-md border border-zinc-300 bg-white px-2 text-right text-sm font-semibold text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
                        aria-label={`${label} (%)`}
                    />
                    <span className="text-xs text-zinc-500">%</span>
                </span>
            </div>
            {detailsOpen ? (
                <RankingWeightDetails
                    id={`ranking-weight-details-${detailKey}`}
                    signal={detailKey}
                    weightPercent={formatWeightPercent(value)}
                />
            ) : null}
        </div>
    );
}

interface WeightGroupProps {
    title: string;
    description: string;
    total: number;
    children: ReactNode;
}

// Nhóm này trình bày công thức tổng Standard, cách hiểu tỷ trọng và tám ô điều chỉnh tương ứng.
// Điểm được tính từ các tỷ trọng đã chuẩn hóa, trừ khoản sở thích âm rồi giới hạn trong khoảng 0–1.
function WeightGroup({
    title,
    description,
    total,
    children,
}: WeightGroupProps) {
    return (
        <section className="overflow-hidden rounded-xl border border-zinc-200">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-950">
                        {title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                        {description}
                    </p>
                </div>
                <div className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-500">
                    Tổng tỷ trọng{' '}
                    <span className="font-semibold text-zinc-950">
                        {total}%
                    </span>
                </div>
            </div>
            <div className="space-y-3 border-b border-zinc-200 bg-zinc-50 px-4 py-4">
                <div>
                    <h4 className="text-sm font-semibold text-zinc-900">
                        Điểm Standard dùng để chọn thứ tự sản phẩm
                    </h4>
                    <p className="mt-1 text-sm leading-6 text-zinc-600">
                        Hệ thống cho mỗi sản phẩm 8 điểm thành phần, mỗi điểm
                        nằm từ 0 đến 1. Điểm 0 nghĩa là tiêu chí đó không tìm
                        thấy dấu hiệu phù hợp; điểm 1 là mức cao nhất mà công
                        thức cho phép. Đây là điểm để sắp thứ tự sản phẩm, không
                        phải lời dự đoán rằng người dùng sẽ mua.
                    </p>
                </div>
                <section className="rounded-lg border border-zinc-200 bg-white p-4">
                    <h4 className="text-sm font-semibold text-zinc-900">
                        Công thức tổng Standard Ranking
                    </h4>
                    <div className="mt-2 space-y-1 rounded-md bg-zinc-50 p-3 font-mono text-[13px] leading-6 text-zinc-900">
                        <p>Điểm Standard = giới hạn 0–1 [</p>
                        <p>
                            (Độ phù hợp hồ sơ × w₁) + (Ngữ cảnh phiên truy cập ×
                            w₂)
                        </p>
                        <p>
                            + (Tương đồng nội dung × w₃) + (Hành vi liên quan ×
                            w₄)
                        </p>
                        <p>
                            + (Độ phổ biến × w₅) + (Độ mới × w₆) + (Chất lượng ×
                            w₇)
                        </p>
                        <p>+ (Khám phá × w₈) − khoản trừ do sở thích âm</p>
                        <p>]</p>
                    </div>
                    <div className="mt-3 space-y-2 text-sm leading-6 text-zinc-600">
                        <p>
                            <code className="rounded bg-zinc-100 px-1 text-zinc-900">
                                w₁ … w₈ = tỷ trọng nhập của từng mục ÷ tổng 8 tỷ
                                trọng
                            </code>{' '}
                            Thứ tự w₁ đến w₈ giống thứ tự tám mục bên dưới. Ví
                            dụ tỷ trọng nhập là 25% trên tổng 100% thì w₁ =
                            0.25. Nếu tổng cả tám ô bằng 0, hệ thống dùng bộ tỷ
                            trọng mặc định.
                        </p>
                        <p>
                            Khoản trừ chỉ đến từ sở thích âm như bỏ giỏ hoặc
                            hoàn trả:{' '}
                            <code className="rounded bg-zinc-100 px-1 text-zinc-900">
                                min(0.15, 0.15 × tổng [độ lớn điểm âm đã giảm ÷
                                8])
                            </code>
                            . Khoản này tối đa là 0.15 điểm, tức 15/100.
                        </p>
                        <div>
                            <p className="font-medium text-zinc-900">
                                Ví dụ minh họa, không phải dữ liệu khách hàng
                                thật
                            </p>
                            <p>
                                Với tỷ trọng 25%, 18%, 15%, 10%, 12%, 8%, 8%, 4%
                                và điểm tám mục lần lượt là 0.80, 0.50, 0.82,
                                0.50, 0.67, 0.80, 0.87, 0; nếu khoản trừ là
                                0.075 thì:
                            </p>
                            <code className="mt-1 block break-words rounded bg-zinc-100 px-2 py-1 text-zinc-900">
                                0.80×0.25 + 0.50×0.18 + 0.82×0.15 + 0.50×0.10 +
                                0.67×0.12 + 0.80×0.08 + 0.87×0.08 + 0×0.04 −
                                0.075 = 0.602
                            </code>
                            <p className="mt-1">
                                Kết quả là 0.602/1, tương đương 60.2/100 điểm
                                Standard trước bước cân bằng danh mục, thương
                                hiệu và cửa hàng. Riêng lượt chưa có hồ sơ sở
                                thích có thể được trộn thêm nguồn sản phẩm mới
                                hoặc bán chạy trước khi trả danh sách.
                            </p>
                        </div>
                    </div>
                </section>
                <ol className="space-y-2 text-sm leading-6 text-zinc-700">
                    <li className="flex items-start gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200">
                            1
                        </span>
                        <p>
                            <span className="font-semibold text-zinc-900">
                                Tỷ trọng cho biết tiêu chí quan trọng đến đâu.
                            </span>{' '}
                            Hệ thống lấy tỷ trọng của từng tiêu chí chia cho
                            tổng tỷ trọng để quy đổi cả nhóm về 100%. Ví dụ, nếu
                            các ô đang cộng thành 80% thì ô 20% thực tế được
                            tính như 20 ÷ 80 = 25%. Vì vậy thay đổi một ô cũng
                            làm tỷ lệ đóng góp của các ô khác thay đổi nhẹ sau
                            khi quy đổi. Nếu tất cả ô đều bằng 0, hệ thống dùng
                            lại bộ tỷ trọng mặc định để vẫn chấm được sản phẩm.
                        </p>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200">
                            2
                        </span>
                        <p>
                            <span className="font-semibold text-zinc-900">
                                Điểm tiêu chí × tỷ trọng = điểm tiêu chí đóng
                                góp.
                            </span>{' '}
                            Ví dụ, 0.8 nghĩa là sản phẩm đạt 80/100 điểm riêng ở
                            tiêu chí này; 25% được đổi thành 0.25. Phần nó đóng
                            góp vào tổng điểm là{' '}
                            <code className="rounded bg-white px-1 text-zinc-950">
                                0.8 × 0.25 = 0.20
                            </code>
                            , tức 20/100 điểm tổng. Đây mới là phần đóng góp của
                            một tiêu chí; còn phải cộng 7 tiêu chí khác.
                        </p>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200">
                            3
                        </span>
                        <p>
                            <span className="font-semibold text-zinc-900">
                                Cộng điểm rồi trừ dấu hiệu không thích.
                            </span>{' '}
                            Hệ thống cộng 8 phần đóng góp. Nếu hồ sơ cho thấy
                            người dùng không thích sản phẩm, chẳng hạn đã bỏ
                            khỏi giỏ hoặc hoàn trả, hệ thống trừ thêm một khoản;
                            khoản trừ này không vượt quá 0.15, tức 15/100 điểm.
                        </p>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200">
                            4
                        </span>
                        <p>
                            <span className="font-semibold text-zinc-900">
                                Giữ điểm trong thang 0–1.
                            </span>{' '}
                            Sau khi cộng/trừ, số thấp hơn 0 được đưa về 0; số
                            cao hơn 1 được đưa về 1. Ví dụ, 0.72 tương đương
                            72/100. Đây là căn cứ xếp hạng ban đầu; hệ thống còn
                            cân bằng danh mục/thương hiệu để danh sách không bị
                            lặp quá nhiều.
                        </p>
                    </li>
                </ol>
            </div>
            <div className="space-y-2 p-3">{children}</div>
        </section>
    );
}

interface AiRankingDetailsProps {
    blend: number;
}

// Mở hoặc thu gọn phần giải thích duy nhất về công thức, ví dụ số và điều kiện chạy AI.
function AiRankingDetails({ blend }: AiRankingDetailsProps) {
    const [detailsOpen, setDetailsOpen] = useState(false);
    const standardShare = 1 - blend;
    const exampleScore = 0.6 * standardShare + 0.8 * blend;

    return (
        <div className="mt-3 border-t border-zinc-200 pt-3">
            <button
                type="button"
                aria-expanded={detailsOpen}
                aria-controls="ai-ranking-details"
                onClick={() => setDetailsOpen((open) => !open)}
                className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-zinc-700 outline-none transition hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
                <Info className="size-4" aria-hidden="true" />
                {detailsOpen
                    ? 'Ẩn giải thích'
                    : 'Xem giải thích AI-Enhanced Ranking'}
                {detailsOpen ? (
                    <ChevronUp className="size-4" aria-hidden="true" />
                ) : (
                    <ChevronDown className="size-4" aria-hidden="true" />
                )}
            </button>

            {detailsOpen ? (
                <div
                    id="ai-ranking-details"
                    className="mt-3 space-y-4 rounded-lg bg-white p-4 text-sm leading-6 text-zinc-600 ring-1 ring-inset ring-zinc-200"
                >
                    <section>
                        <h4 className="font-semibold text-zinc-900">
                            1. AI kết hợp với Standard bằng cách nào?
                        </h4>
                        <p className="mt-1">
                            Mỗi sản phẩm đã có một điểm Standard từ 8 tiêu chí.
                            Model AI cũng trả về một điểm từ 0 đến 1 cho sản
                            phẩm đó. Tỷ lệ bên trên quyết định hai điểm được pha
                            với nhau ra sao:
                        </p>
                        <code className="mt-2 block overflow-x-auto rounded-md bg-zinc-100 px-3 py-2 font-mono text-xs leading-5 text-zinc-950">
                            Điểm cuối = giới hạn 0–1 [Điểm Standard × (1 − b) +
                            Điểm model AI × b]
                        </code>
                        <p className="mt-2">
                            <code className="rounded bg-zinc-100 px-1 text-zinc-900">
                                b = {blend.toFixed(2)} (
                                {Math.round(blend * 100)}%)
                            </code>{' '}
                            là tỷ lệ ảnh hưởng AI hiện tại. Phần còn lại{' '}
                            <code className="rounded bg-zinc-100 px-1 text-zinc-900">
                                1 − b = {standardShare.toFixed(2)} (
                                {Math.round(standardShare * 100)}%)
                            </code>{' '}
                            vẫn là điểm Standard. Tỷ lệ AI bị giới hạn tối đa
                            50%; đây là tỷ trọng pha điểm, không phải độ chính
                            xác của model.
                        </p>
                    </section>

                    <section>
                        <h4 className="font-semibold text-zinc-900">
                            2. Ví dụ với tỷ lệ đang chọn
                        </h4>
                        <p className="mt-1">
                            Giả sử một sản phẩm được Standard chấm{' '}
                            <code className="rounded bg-zinc-100 px-1 text-zinc-900">
                                0.60/1
                            </code>{' '}
                            và model AI chấm{' '}
                            <code className="rounded bg-zinc-100 px-1 text-zinc-900">
                                0.80/1
                            </code>
                            ; công thức sẽ là:
                        </p>
                        <code className="mt-2 block overflow-x-auto rounded-md bg-zinc-100 px-3 py-2 font-mono text-xs leading-5 text-zinc-950">
                            0.60 × {standardShare.toFixed(2)} + 0.80 ×{' '}
                            {blend.toFixed(2)} = {exampleScore.toFixed(3)}
                        </code>
                        <p className="mt-2">
                            Kết quả này chỉ minh họa cách pha hai điểm, không
                            phải dữ liệu thật. Điểm model AI được dùng để xếp
                            hạng; không mặc định đồng nghĩa với xác suất người
                            dùng sẽ mua sản phẩm.
                        </p>
                    </section>

                    <section>
                        <h4 className="font-semibold text-zinc-900">
                            3. Model AI nhận những dữ liệu nào?
                        </h4>
                        <p className="mt-1">
                            Với mỗi sản phẩm, Recommendation Service gửi 9 con
                            số đã chuẩn hóa trong khoảng 0–1: độ phù hợp hồ sơ,
                            ngữ cảnh phiên, tương đồng nội dung, hành vi liên
                            quan, độ phổ biến, độ mới, chất lượng, khám phá và
                            điểm phạt sở thích âm. Model học cách kết hợp các
                            tín hiệu này từ artifact đã huấn luyện; request
                            không gửi nguyên văn hồ sơ hay mô tả sản phẩm sang
                            bước dự đoán ranking.
                        </p>
                        <p className="mt-2">
                            Artifact LightGBM được huấn luyện riêng từ dữ liệu
                            gồm các tín hiệu và nhãn mục tiêu 0–1. Code runtime
                            chỉ gọi artifact đã nạp, không tự huấn luyện lại sau
                            mỗi lượt xem hoặc lượt click. Vì vậy chất lượng phụ
                            thuộc vào dữ liệu và nhãn dùng để huấn luyện.
                        </p>
                    </section>

                    <section>
                        <h4 className="font-semibold text-zinc-900">
                            4. Cần điều kiện gì để request thật sự dùng AI?
                        </h4>
                        <ol className="mt-1 list-inside list-decimal space-y-1">
                            <li>Policy bật AI-Enhanced Ranking.</li>
                            <li>Khi bật, mọi request đều được thử bằng model AI.</li>
                            <li>
                                AI Service phải có model artifact thật và trả về điểm hợp lệ cho sản phẩm.
                            </li>
                        </ol>
                        <p className="mt-2">
                            Nếu thiếu model, timeout, lỗi hoặc không có điểm hợp
                            lệ, hệ thống dùng lại Standard và analytics ghi nhận
                            đúng mode Standard/Fallback.
                        </p>
                    </section>

                    <section className="rounded-md bg-zinc-100 p-3">
                        <h4 className="font-semibold text-zinc-900">
                            Lưu ý với cấu hình local mặc định
                        </h4>
                        <p className="mt-1">
                            Docker Compose có thể tắt AI hoặc candidate source
                            bằng master switch vận hành; đồng thời{' '}
                            <code className="rounded bg-white px-1 text-zinc-900">
                                RANKING_MODEL_PATH
                            </code>{' '}
                            để trống. Khi chưa cấu hình model đã huấn luyện, AI
                            Service dùng scorer dự phòng mà Recommendation
                            Service chủ động bỏ qua. Do đó hệ thống vẫn xếp bằng
                            Standard. Muốn AI thật sự tác động cần chuẩn bị
                            artifact model và cấu hình đường dẫn nạp model. Khi
                            AI bật và model sẵn sàng, mọi request sẽ được thử
                            bằng AI.
                        </p>
                    </section>
                </div>
            ) : null}
        </div>
    );
}

// Render policy Standard, cấu hình AI kèm phần giải thích có thể mở rộng và lịch sử; việc lưu/rollback vẫn do component cha xử lý.
export function AdminRecommendationPolicy({
    policy,
    history,
    loading,
    saving,
    rollbackSaving,
    onSave,
    onRollback,
}: Props) {
    // Parent dùng policy version làm key để reset form sau khi save/rollback, tránh setState trong effect.
    const [hybridWeights, setHybridWeights] = useState<Record<string, number>>(
        () => policy?.config.hybridWeights ?? {},
    );
    const [mlEnabled, setMlEnabled] = useState(
        () => policy?.config.mlEnabled ?? false,
    );
    const [mlBlend, setMlBlend] = useState(() => policy?.config.mlBlend ?? 0.3);
    const [reason, setReason] = useState('');

    // Gửi Standard weights và cấu hình AI; backend normalize và audit trong transaction.
    function save(): void {
        onSave({
            hybridWeights,
            mlEnabled,
            mlBlend: normalizeBlend(mlBlend),
            reason,
        });
    }

    if (loading && !policy) {
        return (
            <div className="rounded-xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500">
                Đang tải policy...
            </div>
        );
    }

    const modelStatus = policy?.runtime.model;
    const modelStatusLabel = !modelStatus?.reachable
        ? 'Không kết nối'
        : modelStatus.ready
          ? 'Ready'
          : 'Fallback';
    const modelStatusClassName = !modelStatus?.reachable
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : modelStatus.ready
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-zinc-200 bg-zinc-100 text-zinc-600';

    return (
        <div className="space-y-4">
            <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2 className="mt-1 text-lg font-semibold text-zinc-950">
                            Policy ranking runtime
                        </h2>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
                            Điều chỉnh mức độ ảnh hưởng của từng tín hiệu khi hệ
                            thống chọn sản phẩm gợi ý.
                        </p>
                    </div>
                </div>

                <div className="mt-5 space-y-4">
                    <section className="rounded-xl border border-zinc-200 bg-white p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-950">
                                    Trạng thái đang chạy
                                </h3>
                                <p className="mt-1 text-xs leading-5 text-zinc-500">
                                    Đây là trạng thái policy đã lưu kết hợp với model và các master switch của môi trường.
                                </p>
                            </div>
                            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600">
                                Version {policy?.version ?? '—'}
                            </span>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            <div className="rounded-lg border border-zinc-200 bg-white p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                    Standard Ranking
                                </p>
                                <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-zinc-950">
                                    <CheckCircle2 className="size-4 text-zinc-700" />
                                    Đang hoạt động · Baseline bắt buộc
                                </p>
                            </div>
                            <div className="rounded-lg border border-zinc-200 bg-white p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                    AI Ranking
                                </p>
                                <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-zinc-950">
                                    {policy?.runtime.model.ready ? (
                                        <CheckCircle2 className="size-4 text-zinc-700" />
                                    ) : (
                                        <CircleAlert className="size-4 text-zinc-500" />
                                    )}
                                    {policy?.runtime.aiPolicyEnabled
                                        ? policy.runtime.model.ready
                                            ? 'Đang hoạt động · 100% request'
                                            : 'Đang fallback về Standard'
                                        : 'Đang tắt'}
                                </p>
                            </div>
                            <div className="rounded-lg border border-zinc-200 bg-white p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                    Model
                                </p>
                                <p className="mt-2 text-sm font-semibold text-zinc-950">
                                    {policy?.runtime.model.modelVersion ?? 'Chưa sẵn sàng'}
                                </p>
                                <p className="mt-1 text-xs text-zinc-500">
                                    {policy?.runtime.model.reachable
                                        ? `${policy.runtime.model.featureCount ?? 0} feature · ${policy.runtime.model.ready ? 'ready' : 'fallback'}`
                                        : 'Không kết nối được AI Service'}
                                </p>
                            </div>
                        </div>
                        {policy?.runtime.aiPolicyEnabled &&
                        (!policy.runtime.model.ready ||
                            !policy.runtime.model.reachable) ? (
                            <div className="mt-3 flex gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs leading-5 text-zinc-600">
                                <CircleAlert className="mt-0.5 size-4 shrink-0" />
                                <p>
                                    Policy đã bật nhưng model thật chưa sẵn sàng. Request vẫn dùng Standard Ranking và analytics ghi nhận đúng mode fallback.
                                </p>
                            </div>
                        ) : null}
                    </section>

                    <WeightGroup
                        title="Standard Ranking"
                        description="Kết hợp tín hiệu hành vi, nội dung và quan hệ giữa các sản phẩm."
                        total={getWeightTotalPercent(hybridWeights)}
                    >
                        <WeightField
                            detailKey="profileAffinity"
                            label="Độ phù hợp hồ sơ"
                            description="Dựa vào sở thích tích lũy để ưu tiên sản phẩm sát nhu cầu lâu dài."
                            value={hybridWeights.profileAffinity}
                            onChange={(value) =>
                                updateWeight(
                                    setHybridWeights,
                                    'profileAffinity',
                                    value,
                                )
                            }
                        />
                        <WeightField
                            detailKey="sessionContext"
                            label="Ngữ cảnh phiên truy cập"
                            description="Điều chỉnh gợi ý theo điều người dùng đang quan tâm trong phiên này."
                            value={hybridWeights.sessionContext}
                            onChange={(value) =>
                                updateWeight(
                                    setHybridWeights,
                                    'sessionContext',
                                    value,
                                )
                            }
                        />
                        <WeightField
                            detailKey="semanticSimilarity"
                            label="Tương đồng nội dung"
                            description="Tìm thêm sản phẩm có nội dung gần với sản phẩm người dùng đang xem."
                            value={hybridWeights.semanticSimilarity}
                            onChange={(value) =>
                                updateWeight(
                                    setHybridWeights,
                                    'semanticSimilarity',
                                    value,
                                )
                            }
                        />
                        <WeightField
                            detailKey="coBehavior"
                            label="Hành vi liên quan"
                            description="Gợi ý các sản phẩm thường được xem, thêm giỏ hoặc mua cùng nhau."
                            value={hybridWeights.coBehavior}
                            onChange={(value) =>
                                updateWeight(
                                    setHybridWeights,
                                    'coBehavior',
                                    value,
                                )
                            }
                        />
                        <WeightField
                            detailKey="popularity"
                            label="Độ phổ biến"
                            description="Bổ sung sản phẩm bán chạy hoặc đang thịnh hành vào danh sách."
                            value={hybridWeights.popularity}
                            onChange={(value) =>
                                updateWeight(
                                    setHybridWeights,
                                    'popularity',
                                    value,
                                )
                            }
                        />
                        <WeightField
                            detailKey="freshness"
                            label="Độ mới"
                            description="Tạo thêm cơ hội hiển thị cho sản phẩm mới đăng."
                            value={hybridWeights.freshness}
                            onChange={(value) =>
                                updateWeight(
                                    setHybridWeights,
                                    'freshness',
                                    value,
                                )
                            }
                        />
                        <WeightField
                            detailKey="quality"
                            label="Chất lượng"
                            description="Ưu tiên sản phẩm có đánh giá tốt, nhiều phản hồi và còn hàng."
                            value={hybridWeights.quality}
                            onChange={(value) =>
                                updateWeight(setHybridWeights, 'quality', value)
                            }
                        />
                        <WeightField
                            detailKey="exploration"
                            label="Khám phá"
                            description="Khám phá mặt hàng mới khi chưa đủ dữ liệu về sở thích."
                            value={hybridWeights.exploration}
                            onChange={(value) =>
                                updateWeight(
                                    setHybridWeights,
                                    'exploration',
                                    value,
                                )
                            }
                        />
                    </WeightGroup>

                    <div className="rounded-xl border border-zinc-200 bg-white p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-sm font-semibold text-zinc-950">
                                        AI-Enhanced Ranking
                                    </h3>
                                    <span
                                        className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${modelStatusClassName}`}
                                    >
                                        {modelStatusLabel}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs leading-5 text-zinc-500">
                                    Khi bật, AI được thử trên toàn bộ request.
                                    Model chưa sẵn sàng hoặc gặp lỗi sẽ tự
                                    fallback về Standard Ranking.
                                </p>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={mlEnabled}
                                aria-label="Bật hoặc tắt AI-Enhanced Ranking"
                                onClick={() => setMlEnabled((enabled) => !enabled)}
                                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 ${mlEnabled ? 'border-zinc-950 bg-white text-zinc-900 hover:bg-zinc-50' : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-950'}`}
                            >
                                <span>{mlEnabled ? 'Đang bật' : 'Đang tắt'}</span>
                                <span
                                    aria-hidden="true"
                                    className={`relative h-5 w-9 rounded-full transition ${mlEnabled ? 'bg-zinc-950' : 'bg-zinc-200'}`}
                                >
                                    <span
                                        className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition ${mlEnabled ? 'left-[18px]' : 'left-0.5'}`}
                                    />
                                </span>
                            </button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <label className="flex items-center gap-2 text-sm text-zinc-700">
                                Tỷ lệ ảnh hưởng
                                <span className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min={0}
                                        max={50}
                                        step={5}
                                        value={Math.round(
                                            normalizeBlend(mlBlend) * 100,
                                        )}
                                        onChange={(event) =>
                                            setMlBlend(
                                                Number(event.target.value) /
                                                    100,
                                            )
                                        }
                                        disabled={!mlEnabled}
                                        className="h-9 w-20 rounded-md border border-zinc-300 bg-white px-2 text-right text-sm font-semibold text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
                                    />
                                    <span className="text-xs text-zinc-500">
                                        %
                                    </span>
                                </span>
                            </label>
                            <p className="text-xs text-zinc-500">
                                Tỷ lệ ảnh hưởng tối đa 50%; phần còn lại giữ
                                điểm Standard Ranking.
                            </p>
                        </div>
                        <p className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs leading-5 text-zinc-600">
                            AI không thay thế hoàn toàn Standard Ranking. Ví dụ blend 30% nghĩa là điểm cuối gồm 70% Standard và 30% điểm từ model AI; khi bật AI, cách pha này áp dụng cho toàn bộ request hợp lệ.
                        </p>
                        <p className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                            <CheckCircle2 className="size-4 text-zinc-700" />
                            Candidate pipeline tự động sử dụng toàn bộ nguồn dữ liệu;
                            ENV chỉ dùng làm công tắc khẩn cấp.
                        </p>
                        <AiRankingDetails blend={normalizeBlend(mlBlend)} />
                    </div>
                </div>

                <div className="mt-5 border-t border-zinc-200 pt-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <label className="min-w-72 flex-1 text-sm font-medium text-zinc-900">
                            Lý do thay đổi{' '}
                            <span className="font-normal text-zinc-400">
                                (không bắt buộc)
                            </span>
                            <input
                                value={reason}
                                onChange={(event) =>
                                    setReason(event.target.value)
                                }
                                maxLength={500}
                                placeholder="Ví dụ: Tăng ưu tiên sản phẩm phù hợp với phiên truy cập"
                                className="mt-2 h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm font-normal text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
                            />
                        </label>
                        <Button
                            type="button"
                            onClick={save}
                            disabled={saving || !policy}
                            className="h-10 self-end"
                        >
                            <Save className="size-4" />
                            {saving ? 'Đang lưu...' : 'Áp dụng policy'}
                        </Button>
                    </div>
                    <p className="mt-2 text-xs text-zinc-400">
                        Khi áp dụng, hệ thống sẽ tạo một version mới để có thể
                        theo dõi hoặc rollback.
                    </p>
                </div>
            </section>

            <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold">Lịch sử policy</h2>
                <div className="mt-3 divide-y divide-zinc-100">
                    {history.map((item) => (
                        <div
                            key={item.version}
                            className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                        >
                            <div>
                                <p className="font-mono text-xs">
                                    {item.version}{' '}
                                    <span className="font-sans text-zinc-400">
                                        · {item.status}
                                    </span>
                                </p>
                                <p className="mt-1 text-xs text-zinc-500">
                                    {item.reason ?? 'Không ghi lý do'} ·{' '}
                                    {formatDate(item.createdAt)}
                                </p>
                            </div>
                            {item.status !== 'ACTIVE' ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onRollback(item.version)}
                                    disabled={rollbackSaving}
                                >
                                    <RotateCcw className="size-4" />
                                    Rollback
                                </Button>
                            ) : null}
                        </div>
                    ))}
                    {history.length === 0 ? (
                        <p className="py-3 text-sm text-zinc-500">
                            Chưa có lịch sử policy.
                        </p>
                    ) : null}
                </div>
            </section>
        </div>
    );
}
