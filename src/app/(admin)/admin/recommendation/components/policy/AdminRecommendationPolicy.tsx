// Panel policy cho Admin: chỉnh trọng số Standard, bật/tắt AI và quản lý lịch sử policy.
// Component không gọi API trực tiếp; component cha sở hữu submit/rollback, còn backend validate và audit policy.

import {
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from 'react';
import {
    Activity,
    Brain,
    Box,
    CircleAlert,
    Clock3,
    Info,
    RotateCcw,
    Save,
    ShieldCheck,
} from 'lucide-react';

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
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

// Format timestamp lịch sử theo locale UI; giá trị lỗi được thay bằng dấu gạch để không làm hỏng panel.
function formatDate(value: string | null): string {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN');
}

// Chặn blend ngoài policy ở UI trước khi gửi; backend vẫn là boundary validate cuối cùng.
function normalizeBlend(value: number): number {
    if (!Number.isFinite(value)) return 0.3;
    return Math.min(0.5, Math.max(0, value));
}

// Chuyển weight nội bộ dạng 0-1 thành phần trăm để Admin chỉnh bằng ô số dễ hiểu.
function formatWeightPercent(value: number | undefined): number {
    return Number.isFinite(value) ? Number(((value ?? 0) * 100).toFixed(2)) : 0;
}

// Tính tổng weight hiển thị để Admin biết policy hiện tại đã phân bổ đủ 100% hay chưa.
function getWeightTotalPercent(weights: Record<string, number>): number {
    return Number(
        (
            Object.values(weights).reduce((sum, value) => sum + value, 0) * 100
        ).toFixed(2),
    );
}

// Cập nhật một weight từ phần trăm và giới hạn giá trị trong khoảng backend cho phép.
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
    label: string;
    description: string;
    value: number | undefined;
    onChange: (value: string) => void;
}

// Hiển thị một tín hiệu và cho phép sửa weight; phần giải thích công thức được đưa vào modal logic chung.
function WeightField({
    label,
    description,
    value,
    onChange,
}: WeightFieldProps) {
    return (
        <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900">{label}</p>
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
        </div>
    );
}

interface WeightGroupProps {
    title: string;
    description: string;
    total: number;
    children: ReactNode;
}

// Gom các weight thành một lưới gọn; không hiển thị công thức trực tiếp để màn policy tập trung vào cấu hình.
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
            <div className="grid gap-3 bg-zinc-50 p-4 sm:grid-cols-2">
                {children}
            </div>
        </section>
    );
}

interface RuntimeStatusCardProps {
    icon: ReactNode;
    eyebrow: string;
    title: string;
    description: string;
    tone: 'neutral' | 'warning' | 'muted';
}

// Chuẩn hóa ba thẻ runtime về cùng một cấu trúc; tone chỉ mô tả trạng thái hiển thị, không thay đổi logic vận hành.
function RuntimeStatusCard({
    icon,
    eyebrow,
    title,
    description,
    tone,
}: RuntimeStatusCardProps) {
    const toneClassName = {
        neutral: {
            icon: 'border-zinc-200 bg-white text-zinc-900',
            badge: 'border-zinc-200 bg-white text-zinc-700',
        },
        warning: {
            icon: 'border-zinc-200 bg-white text-zinc-900',
            badge: 'border-zinc-200 bg-white text-zinc-700',
        },
        muted: {
            icon: 'border-zinc-200 bg-white text-zinc-600',
            badge: 'border-zinc-200 bg-white text-zinc-600',
        },
    }[tone];

    return (
        <div className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-sm">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-zinc-100 transition group-hover:bg-zinc-300" />
            <div className="flex items-start gap-3">
                <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${toneClassName.icon}`}
                >
                    {icon}
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                        {eyebrow}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-950">
                        {title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                        {description}
                    </p>
                </div>
                <span
                    className={`hidden rounded-full border px-2 py-0.5 text-[10px] font-semibold sm:inline-flex ${toneClassName.badge}`}
                >
                    {tone === 'neutral'
                        ? 'Active'
                        : tone === 'warning'
                          ? 'Fallback'
                          : 'Runtime'}
                </span>
            </div>
        </div>
    );
}

interface RankingLogicDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    blend: number;
    weights: Record<string, number>;
}

// Hiển thị công thức và điều kiện phục vụ audit trong một modal; các giá trị weight/blend luôn lấy từ form hiện tại.
function RankingLogicDialog({
    open,
    onOpenChange,
    blend,
    weights,
}: RankingLogicDialogProps) {
    const standardShare = 1 - blend;
    const exampleScore = 0.6 * standardShare + 0.8 * blend;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-h-[calc(100dvh-2rem)] max-w-4xl overflow-y-auto p-0">
                <AlertDialogHeader className="border-b border-zinc-200 px-6 py-5">
                    <AlertDialogTitle>Logic xếp hạng</AlertDialogTitle>
                    <AlertDialogDescription>
                        Chi tiết cách hệ thống chuẩn hóa tín hiệu, tính Standard
                        Ranking và pha điểm AI trước khi sắp xếp sản phẩm.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-5 px-6 py-5 text-sm leading-6 text-zinc-600">
                    <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                        <h3 className="font-semibold text-zinc-950">
                            1. Standard Ranking
                        </h3>
                        <p className="mt-1">
                            Mỗi sản phẩm được chấm theo 8 tín hiệu. Weight được
                            chuẩn hóa về tổng 100%, sau đó điểm được giới hạn
                            trong khoảng 0–1 để dùng cho việc sắp xếp.
                        </p>
                        <code className="mt-3 block overflow-x-auto rounded-lg bg-white px-3 py-2 font-mono text-xs leading-5 text-zinc-950 ring-1 ring-inset ring-zinc-200">
                            Điểm Standard = clamp(0–1, tổng(điểm tín hiệu ×
                            weight) − khoản trừ sở thích âm)
                        </code>
                        <p className="mt-2">
                            Nếu tổng weight bằng 0, hệ thống dùng bộ mặc định.
                            Khoản trừ sở thích âm được giới hạn tối đa 0.15 để
                            không làm một tín hiệu phủ định lấn át toàn bộ điểm.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-semibold text-zinc-950">
                            2. Weight hiện tại của 8 tín hiệu
                        </h3>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <div className="rounded-lg border border-zinc-200 bg-white p-3">
                                <p className="font-medium text-zinc-900">
                                    Độ phù hợp hồ sơ
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {formatWeightPercent(
                                        weights.profileAffinity,
                                    )}
                                    %
                                </p>
                            </div>
                            <div className="rounded-lg border border-zinc-200 bg-white p-3">
                                <p className="font-medium text-zinc-900">
                                    Ngữ cảnh phiên truy cập
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {formatWeightPercent(
                                        weights.sessionContext,
                                    )}
                                    %
                                </p>
                            </div>
                            <div className="rounded-lg border border-zinc-200 bg-white p-3">
                                <p className="font-medium text-zinc-900">
                                    Tương đồng nội dung
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {formatWeightPercent(
                                        weights.semanticSimilarity,
                                    )}
                                    %
                                </p>
                            </div>
                            <div className="rounded-lg border border-zinc-200 bg-white p-3">
                                <p className="font-medium text-zinc-900">
                                    Hành vi liên quan
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {formatWeightPercent(weights.coBehavior)}%
                                </p>
                            </div>
                            <div className="rounded-lg border border-zinc-200 bg-white p-3">
                                <p className="font-medium text-zinc-900">
                                    Độ phổ biến
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {formatWeightPercent(weights.popularity)}%
                                </p>
                            </div>
                            <div className="rounded-lg border border-zinc-200 bg-white p-3">
                                <p className="font-medium text-zinc-900">
                                    Độ mới
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {formatWeightPercent(weights.freshness)}%
                                </p>
                            </div>
                            <div className="rounded-lg border border-zinc-200 bg-white p-3">
                                <p className="font-medium text-zinc-900">
                                    Chất lượng
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {formatWeightPercent(weights.quality)}%
                                </p>
                            </div>
                            <div className="rounded-lg border border-zinc-200 bg-white p-3">
                                <p className="font-medium text-zinc-900">
                                    Khám phá
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {formatWeightPercent(weights.exploration)}%
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                        <h3 className="font-semibold text-zinc-950">
                            3. AI-Enhanced Ranking
                        </h3>
                        <p className="mt-1">
                            Khi AI bật, model nhận 9 feature đã chuẩn hóa của
                            từng candidate và trả về một điểm từ 0 đến 1. Điểm
                            đó được pha với Standard theo cấu hình hiện tại.
                        </p>
                        <code className="mt-3 block overflow-x-auto rounded-lg bg-white px-3 py-2 font-mono text-xs leading-5 text-zinc-950 ring-1 ring-inset ring-zinc-200">
                            Điểm cuối = clamp(0–1, Điểm Standard ×{' '}
                            {standardShare.toFixed(2)} + Điểm AI ×{' '}
                            {blend.toFixed(2)})
                        </code>
                        <p className="mt-2">
                            Blend AI hiện tại là{' '}
                            <strong className="text-zinc-950">
                                {Math.round(blend * 100)}%
                            </strong>
                            . Ví dụ Standard = 0.60 và AI = 0.80 thì điểm cuối
                            là {exampleScore.toFixed(3)}. Đây là điểm xếp hạng,
                            không phải xác suất người dùng mua sản phẩm.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-semibold text-zinc-950">
                            4. Điều kiện chạy và fallback
                        </h3>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                            <li>AI phải được bật trong policy đang áp dụng.</li>
                            <li>AI Service phải có model artifact hợp lệ.</li>
                            <li>
                                Nếu timeout, lỗi hoặc điểm trả về không hợp lệ,
                                request dùng Standard Ranking.
                            </li>
                        </ul>
                    </section>
                </div>

                <AlertDialogFooter className="border-t border-zinc-200 px-6 py-4">
                    <AlertDialogCancel>Đóng</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// Render policy Standard, cấu hình AI và lịch sử; việc lưu/rollback vẫn do component cha xử lý.
export function AdminRecommendationPolicy({
    policy,
    history,
    loading,
    saving,
    rollbackSaving,
    onSave,
    onRollback,
}: Props) {
    // Parent dùng policy version làm key để reset form sau save/rollback, tránh đồng bộ state bằng effect.
    const [hybridWeights, setHybridWeights] = useState<Record<string, number>>(
        () => policy?.config.hybridWeights ?? {},
    );
    const [mlEnabled, setMlEnabled] = useState(
        () => policy?.config.mlEnabled ?? false,
    );
    const [mlBlend, setMlBlend] = useState(() => policy?.config.mlBlend ?? 0.3);
    const [reason, setReason] = useState('');
    const [logicOpen, setLogicOpen] = useState(false);

    // Gửi đúng các field policy còn được hỗ trợ; backend normalize và audit trong transaction.
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
    const modelStatusClassName = 'border-zinc-200 bg-white text-zinc-700';

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
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setLogicOpen(true)}
                    >
                        <Info className="size-4" />
                        Xem logic
                    </Button>
                </div>

                <div className="mt-5 space-y-4">
                    <section className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 shadow-sm">
                                    <Activity className="size-4" />
                                </span>
                                <div>
                                    <h3 className="text-sm font-semibold text-zinc-950">
                                        Trạng thái đang chạy
                                    </h3>
                                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                                        Policy đã lưu, model và master switch
                                        môi trường đang được phản ánh tại đây.
                                    </p>
                                </div>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm">
                                <span className="size-1.5 rounded-full bg-zinc-900" />
                                Version {policy?.version ?? '—'}
                            </span>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            <RuntimeStatusCard
                                icon={<ShieldCheck className="size-4" />}
                                eyebrow="STANDARD RANKING"
                                title="Đang hoạt động"
                                description="Baseline bắt buộc cho mọi request."
                                tone="neutral"
                            />
                            <RuntimeStatusCard
                                icon={<Brain className="size-4" />}
                                eyebrow="AI RANKING"
                                title={
                                    policy?.runtime.aiPolicyEnabled
                                        ? policy.runtime.model.ready
                                            ? 'Đang hoạt động · 100% request'
                                            : 'Đang fallback về Standard'
                                        : 'Đang tắt'
                                }
                                description={
                                    policy?.runtime.aiPolicyEnabled
                                        ? 'Model lỗi hoặc chưa sẵn sàng sẽ tự chuyển về Standard.'
                                        : 'Request hiện tại chỉ dùng Standard Ranking.'
                                }
                                tone={
                                    policy?.runtime.aiPolicyEnabled &&
                                    !policy.runtime.model.ready
                                        ? 'warning'
                                        : 'neutral'
                                }
                            />
                            <RuntimeStatusCard
                                icon={<Box className="size-4" />}
                                eyebrow="MODEL"
                                title={
                                    policy?.runtime.model.modelVersion ??
                                    'Chưa sẵn sàng'
                                }
                                description={
                                    policy?.runtime.model.reachable
                                        ? `${policy.runtime.model.featureCount ?? 0} feature · ${policy.runtime.model.ready ? 'Ready' : 'Fallback'}`
                                        : 'Không kết nối được AI Service.'
                                }
                                tone={
                                    policy?.runtime.model.reachable
                                        ? policy.runtime.model.ready
                                            ? 'neutral'
                                            : 'warning'
                                        : 'muted'
                                }
                            />
                        </div>
                        {policy?.runtime.aiPolicyEnabled &&
                        (!policy.runtime.model.ready ||
                            !policy.runtime.model.reachable) ? (
                            <div className="mt-4 flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 text-xs leading-5 text-zinc-900">
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm">
                                    <CircleAlert className="size-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold">
                                        AI đang dùng fallback an toàn
                                    </p>
                                    <p className="mt-0.5 text-zinc-600">
                                        Request vẫn dùng Standard Ranking;
                                        analytics ghi nhận đúng mode fallback
                                        cho đến khi model sẵn sàng.
                                    </p>
                                </div>
                                <span className="hidden rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-zinc-700 sm:inline-flex">
                                    Fallback
                                </span>
                            </div>
                        ) : null}
                    </section>

                    <WeightGroup
                        title="Standard Ranking"
                        description="Kết hợp tín hiệu hành vi, nội dung và quan hệ giữa các sản phẩm."
                        total={getWeightTotalPercent(hybridWeights)}
                    >
                        <WeightField
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
                            label="Chất lượng"
                            description="Ưu tiên sản phẩm có đánh giá tốt, nhiều phản hồi và còn hàng."
                            value={hybridWeights.quality}
                            onChange={(value) =>
                                updateWeight(setHybridWeights, 'quality', value)
                            }
                        />
                        <WeightField
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
                            <Button
                                variant="ghost"
                                type="button"
                                role="switch"
                                aria-checked={mlEnabled}
                                aria-label="Bật hoặc tắt AI-Enhanced Ranking"
                                onClick={() =>
                                    setMlEnabled((enabled) => !enabled)
                                }
                                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 ${mlEnabled ? 'border-zinc-950 bg-white text-zinc-900 hover:bg-zinc-50' : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-950'}`}
                            >
                                <span>
                                    {mlEnabled ? 'Đang bật' : 'Đang tắt'}
                                </span>
                                <span
                                    aria-hidden="true"
                                    className={`relative h-5 w-9 rounded-full transition ${mlEnabled ? 'bg-zinc-950' : 'bg-zinc-200'}`}
                                >
                                    <span
                                        className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition ${mlEnabled ? 'left-[18px]' : 'left-0.5'}`}
                                    />
                                </span>
                            </Button>
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
                                Tối đa 50%; phần còn lại giữ điểm Standard
                                Ranking.
                            </p>
                        </div>
                        <p className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs leading-5 text-zinc-600">
                            AI điều chỉnh thứ tự trong candidate pool; không
                            thay thế bước filtering, quota hoặc diversity.
                            Candidate pipeline tự động dùng toàn bộ nguồn dữ
                            liệu.
                        </p>
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
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600">
                            <Clock3 className="size-4" />
                        </span>
                        <div>
                            <h2 className="text-base font-semibold text-zinc-950">
                                Lịch sử policy
                            </h2>
                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                                Theo dõi các version đã áp dụng và khôi phục khi
                                cần.
                            </p>
                        </div>
                    </div>
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600">
                        {history.length} version
                    </span>
                </div>

                {history.length > 0 ? (
                    <div className="relative mt-5 space-y-3 pl-4 before:absolute before:bottom-4 before:left-[7px] before:top-4 before:w-px before:bg-zinc-200">
                        {history.map((item) => (
                            <div key={item.version} className="relative pl-7">
                                <span
                                    className={`absolute left-0 top-5 flex size-4 items-center justify-center rounded-full border-4 border-white shadow-sm ${item.status === 'ACTIVE' ? 'bg-zinc-900' : 'bg-zinc-300'}`}
                                />
                                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 transition hover:border-zinc-300 hover:bg-white">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate font-mono text-xs font-semibold text-zinc-900">
                                                {item.version}
                                            </p>
                                            <span
                                                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${item.status === 'ACTIVE' ? 'border-zinc-900 bg-white text-zinc-900' : 'border-zinc-200 bg-white text-zinc-500'}`}
                                            >
                                                {item.status === 'ACTIVE'
                                                    ? 'Đang áp dụng'
                                                    : item.status}
                                            </span>
                                        </div>
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
                                            onClick={() =>
                                                onRollback(item.version)
                                            }
                                            disabled={rollbackSaving}
                                            className="cursor-pointer bg-white"
                                        >
                                            <RotateCcw className="size-4" />
                                            Rollback
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-5 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/60 px-4 py-8 text-center">
                        <p className="text-sm font-medium text-zinc-700">
                            Chưa có lịch sử policy
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                            Các version mới sẽ xuất hiện sau khi bạn áp dụng
                            policy.
                        </p>
                    </div>
                )}
            </section>

            <RankingLogicDialog
                open={logicOpen}
                onOpenChange={setLogicOpen}
                blend={normalizeBlend(mlBlend)}
                weights={hybridWeights}
            />
        </div>
    );
}
