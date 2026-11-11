// Hiển thị read-only trạng thái model và nguồn tạo candidate; không còn điều khiển weight hay chế độ ranking cũ.

import {
    Activity,
    BrainCircuit,
    CircleAlert,
    ShieldCheck,
} from 'lucide-react';

import type { RecommendationAdminPolicy } from '@/services/admin';

interface Props {
    policy: RecommendationAdminPolicy | null;
    loading: boolean;
}

// Phân biệt trạng thái đang tải, lỗi tải policy/status, model chưa sẵn sàng và model đã sẵn sàng.
export function AdminRecommendationPolicy({ policy, loading }: Props) {
    if (loading && !policy) {
        return (
            <section className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 shadow-sm">
                Đang kiểm tra trạng thái model ranking...
            </section>
        );
    }

    if (!policy) {
        return (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950 shadow-sm">
                Không đọc được trạng thái Recommendation Service. Kiểm tra
                kết nối hoặc quyền đọc policy rồi tải lại trang.
            </section>
        );
    }

    const model = policy.runtime.model;
    const sources = policy.runtime.candidateSources;
    const isReady = model?.reachable === true && model.ready === true;

    return (
        <div className="space-y-4">
            <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-700">
                            <BrainCircuit className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <h2 className="text-base font-semibold text-zinc-950">
                                Model xếp hạng đang dùng
                            </h2>
                            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-600">
                                Mỗi candidate được chuyển thành vector gồm 8 tiêu
                                chí và tín hiệu phạt sở thích âm. LambdaRank học
                                cách kết hợp các feature thành điểm xếp hạng.
                            </p>
                        </div>
                    </div>
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            isReady
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-amber-200 bg-amber-50 text-amber-800'
                        }`}
                    >
                        {isReady ? (
                            <ShieldCheck className="size-3.5" aria-hidden="true" />
                        ) : (
                            <CircleAlert className="size-3.5" aria-hidden="true" />
                        )}
                        {isReady ? 'Model sẵn sàng' : 'Model chưa sẵn sàng'}
                    </span>
                </div>

                <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                        <dt className="text-xs text-zinc-500">Chế độ serving</dt>
                        <dd className="mt-1 font-mono text-sm font-semibold text-zinc-900">
                            {policy.rankingMode}
                        </dd>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                        <dt className="text-xs text-zinc-500">Mục tiêu huấn luyện</dt>
                        <dd className="mt-1 font-mono text-sm font-semibold text-zinc-900">
                            {policy.objective}
                        </dd>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                        <dt className="text-xs text-zinc-500">Phiên bản artifact</dt>
                        <dd className="mt-1 break-all font-mono text-sm font-semibold text-zinc-900">
                            {model.modelVersion ?? 'Chưa nạp'}
                        </dd>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                        <dt className="text-xs text-zinc-500">Số feature</dt>
                        <dd className="mt-1 font-mono text-sm font-semibold text-zinc-900">
                            {model.featureCount ?? '—'}
                        </dd>
                    </div>
                </dl>

                {!isReady ? (
                    <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
                        {!model.reachable
                            ? 'AI Service chưa phản hồi. Recommendation không phát danh sách được xếp bằng công thức thay thế; cần kiểm tra kết nối và trạng thái service.'
                            : 'AI Service phản hồi nhưng chưa nạp artifact LambdaRank hợp lệ. Cần train/deploy model có đúng schema trước khi phục vụ recommendation.'}
                    </p>
                ) : null}

                <p className="mt-4 border-t border-zinc-100 pt-4 text-xs leading-5 text-zinc-500">
                    Version policy: <code>{policy.version}</code>. Điểm
                    LambdaRank là relevance score thô để sắp xếp, không phải xác
                    suất mua. Khi model lỗi, API trả trạng thái unavailable thay
                    vì chuyển sang ranker khác.
                </p>
            </section>

            <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600">
                        <Activity className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                        <h2 className="text-base font-semibold text-zinc-950">
                            Nguồn tạo candidate
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-zinc-500">
                            Các nguồn tìm sản phẩm tạo candidate pool; model
                            quyết định thứ tự chính, sau đó diversity áp dụng
                            giới hạn danh mục, thương hiệu và shop.
                        </p>
                    </div>
                </div>

                <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-zinc-200 p-3">
                        <dt className="text-xs text-zinc-500">Semantic search</dt>
                        <dd className="mt-1 text-sm font-semibold text-zinc-900">
                            {sources?.semanticEnabled ? 'Đang bật' : 'Đang tắt'}
                        </dd>
                    </div>
                    <div className="rounded-lg border border-zinc-200 p-3">
                        <dt className="text-xs text-zinc-500">Co-behavior</dt>
                        <dd className="mt-1 text-sm font-semibold text-zinc-900">
                            {sources?.coBehaviorEnabled ? 'Đang bật' : 'Đang tắt'}
                        </dd>
                    </div>
                    <div className="rounded-lg border border-zinc-200 p-3">
                        <dt className="text-xs text-zinc-500">Ranking policy</dt>
                        <dd className="mt-1 text-sm font-semibold text-zinc-900">
                            LambdaRank model-only
                        </dd>
                    </div>
                </dl>
            </section>
        </div>
    );
}
