'use client';

import { useMemo, useState } from 'react';
import {
    Check,
    CircleAlert,
    Clock3,
    LoaderCircle,
    Package,
    Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type { SellerCopilotActionProposalCardProps } from '@/app/(seller)/seller/ai/bingpt/types/chat/action-proposal-card.types';

// Hiển thị preview theo từng SKU với khoảng đệm rõ ràng giữa khung nhóm và từng thay đổi.
// Batch thông thường giữ lựa chọn hiện tại; preview xả hàng mặc định chưa chọn để seller chọn SKU muốn áp dụng.
// Payload là snapshot trước/sau, còn quyền ghi và kiểm tra stale vẫn thuộc backend xác nhận.
// Trạng thái thành công/lỗi/hết hạn dùng màu ngữ nghĩa nhẹ, không làm thay đổi luồng xác nhận.
export function SellerCopilotActionProposalCard({
    proposals,
    onConfirm,
    onRevise,
}: SellerCopilotActionProposalCardProps) {
    const pendingIds = useMemo(
        () =>
            proposals
                .filter((proposal) => proposal.status === 'pending')
                .map((proposal) => proposal.proposalId),
        [proposals],
    );
    const hasSlowMovingClearance = proposals.some(
        (proposal) =>
            proposal.payload.kind === 'SET_VARIANT_PRICE' &&
            proposal.payload.priceRecommendation?.kind ===
                'SLOW_MOVING_CLEARANCE',
    );
    // Chiến dịch xả hàng cần seller chủ động chọn SKU; proposal thao tác trực tiếp giữ hành vi cũ.
    const [selectedIds, setSelectedIds] = useState<string[]>(() =>
        hasSlowMovingClearance ? [] : pendingIds,
    );
    const [editedTargets, setEditedTargets] = useState<Record<string, string>>(
        () =>
            proposals.reduce<Record<string, string>>((targets, proposal) => {
                if (proposal.payload.kind === 'SET_INVENTORY') {
                    targets[proposal.proposalId] = String(
                        proposal.payload.nextAvailable,
                    );
                }
                return targets;
            }, {}),
    );
    const selected = proposals.filter(
        (proposal) =>
            selectedIds.includes(proposal.proposalId) &&
            proposal.status === 'pending',
    );
    const completedCount = proposals.filter(
        (proposal) => proposal.status === 'completed',
    ).length;
    const failedCount = proposals.filter(
        (proposal) => proposal.status === 'failed',
    ).length;
    const expiredCount = proposals.filter(
        (proposal) => proposal.status === 'expired',
    ).length;
    const hasPendingProposals = pendingIds.length > 0;

    // Chỉ batch cần checkbox; với một proposal, toàn bộ card chính là đối tượng đang được xác nhận.
    const toggle = (proposalId: string, checked: boolean) => {
        setSelectedIds((current) =>
            checked
                ? [...new Set([...current, proposalId])]
                : current.filter((id) => id !== proposalId),
        );
    };

    return (
        <section className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white text-sm shadow-sm">
            <div
                className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 ${hasPendingProposals ? 'border-zinc-100 bg-zinc-50/80' : 'border-zinc-200 bg-zinc-50/80'}`}
            >
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white">
                        <Package className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="font-semibold text-zinc-900">
                            Đề xuất vận hành sản phẩm
                        </p>
                        <p className="text-xs text-zinc-600">
                            {hasPendingProposals
                                ? pendingIds.length === 1 &&
                                  proposals.length === 1
                                    ? 'Kiểm tra và xác nhận thay đổi cho sản phẩm này.'
                                    : `${pendingIds.length} thay đổi đang chờ xác nhận${completedCount ? ` · ${completedCount} đã áp dụng` : ''}${failedCount ? ` · ${failedCount} thất bại` : ''}${expiredCount ? ` · ${expiredCount} đã hết hạn` : ''}.`
                                : completedCount === proposals.length
                                  ? `${completedCount} thay đổi đã được áp dụng thành công.`
                                  : `${completedCount} đã áp dụng · ${failedCount} thất bại · ${expiredCount} đã hết hạn.`}
                        </p>
                    </div>
                </div>
                {pendingIds.length > 1 ? (
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-600">
                        <Checkbox
                            checked={pendingIds.every((id) =>
                                selectedIds.includes(id),
                            )}
                            onCheckedChange={(checked) =>
                                setSelectedIds(checked ? pendingIds : [])
                            }
                        />
                        Chọn tất cả
                    </label>
                ) : null}
            </div>
            <div className="space-y-3 bg-zinc-50/60 p-3 sm:space-y-4 sm:p-4">
                {proposals.map((proposal) => {
                    const payload = proposal.payload;
                    // Màu trạng thái chỉ phản ánh kết quả trả về; pending vẫn giữ giao diện trung tính để nổi bật thao tác cần làm.
                    const statusTone =
                        proposal.status === 'completed'
                            ? 'success'
                            : proposal.status === 'expired'
                              ? 'expired'
                              : proposal.status === 'failed'
                                ? 'failed'
                                : 'pending';
                    const statusBadgeClass =
                        statusTone === 'success'
                            ? 'border-zinc-300 bg-zinc-100 text-zinc-800'
                            : statusTone === 'expired'
                              ? 'border-amber-200 bg-amber-50 text-amber-800'
                              : statusTone === 'failed'
                                ? 'border-rose-200 bg-rose-50 text-rose-800'
                                : 'border-zinc-200 bg-zinc-50 text-zinc-600';
                    const targetValue =
                        editedTargets[proposal.proposalId] ??
                        (payload.kind === 'SET_INVENTORY'
                            ? String(payload.nextAvailable)
                            : '');
                    const targetNumber = Number(targetValue);
                    const hasValidTarget =
                        targetValue.trim() !== '' &&
                        Number.isSafeInteger(targetNumber) &&
                        targetNumber >= 0 &&
                        targetNumber <= 2_147_483_647;
                    const title =
                        payload.kind === 'SET_VARIANT_PRICE'
                            ? 'Điều chỉnh giá'
                            : payload.kind === 'SET_INVENTORY'
                              ? payload.recommendationReason === 'LOW_STOCK'
                                  ? 'Đề xuất bổ sung hàng'
                                  : 'Điều chỉnh tồn kho'
                              : 'Cập nhật nội dung';
                    const detail =
                        payload.kind === 'SET_INVENTORY'
                            ? `Tồn khả dụng: ${payload.expectedAvailable} → ${payload.nextAvailable}${payload.lowStockThreshold !== undefined ? ` (ngưỡng ${payload.lowStockThreshold})` : ''}`
                            : payload.kind === 'SET_VARIANT_PRICE'
                              ? `Giá: ${payload.expectedPrice.toLocaleString('vi-VN')}đ → ${payload.nextPrice.toLocaleString('vi-VN')}đ · ${payload.variantName}`
                              : [
                                    payload.expectedName !== undefined
                                        ? `Tên: “${payload.expectedName}” → “${payload.nextName}”`
                                        : null,
                                    payload.expectedDescription !== undefined
                                        ? `Mô tả: “${(payload.expectedDescription ?? '(chưa có)').slice(0, 160)}” → “${(payload.nextDescription ?? '').slice(0, 160)}”`
                                        : null,
                                ]
                                    .filter(Boolean)
                                    .join(' · ');
                    return (
                        <article
                            key={proposal.proposalId}
                            className={`rounded-xl border p-4 shadow-sm transition-colors sm:p-5 ${statusTone === 'success' ? 'border-zinc-200 bg-white' : statusTone === 'expired' ? 'border-amber-200 bg-amber-50/20' : statusTone === 'failed' ? 'border-rose-200 bg-rose-50/20' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}
                        >
                            <div className="flex items-start gap-3">
                                {pendingIds.length > 1 &&
                                proposal.status === 'pending' ? (
                                    <Checkbox
                                        className="mt-0.5"
                                        checked={selectedIds.includes(
                                            proposal.proposalId,
                                        )}
                                        onCheckedChange={(checked) =>
                                            toggle(
                                                proposal.proposalId,
                                                checked === true,
                                            )
                                        }
                                        aria-label={`Chọn ${payload.productName}`}
                                    />
                                ) : null}
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone === 'pending' ? 'border-zinc-200 bg-zinc-100 text-zinc-700' : statusBadgeClass}`}
                                            >
                                                <Tag
                                                    className={`size-3.5 ${statusTone === 'pending' ? 'text-zinc-500' : ''}`}
                                                    aria-hidden="true"
                                                />
                                                {title}
                                            </span>
                                            <p className="mt-2 break-words text-sm font-semibold leading-5 text-zinc-900">
                                                {payload.productName}
                                                {'variantName' in payload
                                                    ? ` · ${payload.variantName}`
                                                    : ''}
                                            </p>
                                            <p
                                                className={`mt-2 inline-flex max-w-full rounded-lg px-3 py-2 text-xs leading-5 ${statusTone === 'success' ? 'bg-zinc-100 text-zinc-800' : statusTone === 'expired' ? 'bg-amber-50 text-amber-800' : statusTone === 'failed' ? 'bg-rose-50 text-rose-800' : 'bg-zinc-50 text-zinc-600'}`}
                                            >
                                                {detail}
                                            </p>
                                            {payload.kind === 'SET_VARIANT_PRICE' &&
                                            payload.priceRecommendation?.kind ===
                                                'SLOW_MOVING_CLEARANCE' ? (
                                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-600">
                                                    <span className="rounded-md bg-zinc-50 px-2.5 py-1.5">
                                                        Tồn {payload.priceRecommendation.available} · bán {payload.priceRecommendation.quantitySold} trong {payload.priceRecommendation.periodDays} ngày
                                                    </span>
                                                    <span className="rounded-md bg-zinc-50 px-2.5 py-1.5">
                                                        Giảm {payload.priceRecommendation.effectiveDiscountPercent.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}%
                                                        {payload.priceRecommendation.effectiveDiscountPercent !== payload.priceRecommendation.requestedDiscountPercent
                                                            ? ` (yêu cầu ${payload.priceRecommendation.requestedDiscountPercent}%)`
                                                            : ''}
                                                    </span>
                                                    {payload.minimumPrice !== undefined ? (
                                                        <span className="rounded-md bg-zinc-50 px-2.5 py-1.5">
                                                            Giá sàn {payload.minimumPrice.toLocaleString('vi-VN')}đ
                                                        </span>
                                                    ) : null}
                                                </div>
                                            ) : null}
                                        </div>
                                        {proposal.status === 'pending' ? (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={
                                                    proposals.length === 1
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                disabled={proposal.isConfirming}
                                                onClick={() =>
                                                    onConfirm([proposal])
                                                }
                                                className="shrink-0 self-start rounded-lg px-4"
                                            >
                                                {proposal.isConfirming ? (
                                                    <LoaderCircle className="size-4 animate-spin" />
                                                ) : (
                                                    'Xác nhận'
                                                )}
                                            </Button>
                                        ) : (
                                            <span
                                                role="status"
                                                className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadgeClass}`}
                                            >
                                                {proposal.status ===
                                                'completed' ? (
                                                    <Check
                                                        className="size-3.5"
                                                        aria-hidden="true"
                                                    />
                                                ) : proposal.status ===
                                                  'expired' ? (
                                                    <Clock3
                                                        className="size-3.5"
                                                        aria-hidden="true"
                                                    />
                                                ) : (
                                                    <CircleAlert
                                                        className="size-3.5"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                {proposal.status === 'completed'
                                                    ? 'Đã áp dụng'
                                                    : proposal.status ===
                                                        'expired'
                                                      ? 'Đã hết hạn'
                                                      : 'Thất bại'}
                                            </span>
                                        )}
                                    </div>
                                    {payload.kind === 'SET_INVENTORY' &&
                                    proposal.status === 'pending' ? (
                                        <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-zinc-100 pt-3">
                                            <label
                                                htmlFor={`target-${proposal.proposalId}`}
                                                className="text-xs font-medium text-zinc-600"
                                            >
                                                Tồn kho mới
                                            </label>
                                            <Input
                                                id={`target-${proposal.proposalId}`}
                                                type="number"
                                                min={0}
                                                max={2_147_483_647}
                                                step={1}
                                                inputMode="numeric"
                                                aria-label={`Tồn kho mới cho ${payload.productName} ${payload.variantName}`}
                                                value={targetValue}
                                                onChange={(event) =>
                                                    setEditedTargets(
                                                        (current) => ({
                                                            ...current,
                                                            [proposal.proposalId]:
                                                                event.target
                                                                    .value,
                                                        }),
                                                    )
                                                }
                                                className="h-10 w-32 rounded-lg border-zinc-300 bg-white focus-visible:ring-zinc-400"
                                            />
                                            {targetNumber !==
                                            payload.nextAvailable ? (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={
                                                        proposal.isUpdating ||
                                                        !hasValidTarget
                                                    }
                                                    onClick={() =>
                                                        onRevise(
                                                            proposal,
                                                            targetNumber,
                                                        )
                                                    }
                                                    className="h-9 rounded-lg border-zinc-300 px-3"
                                                >
                                                    {proposal.isUpdating ? (
                                                        <LoaderCircle className="size-4 animate-spin" />
                                                    ) : (
                                                        'Lưu mức mới'
                                                    )}
                                                </Button>
                                            ) : null}
                                        </div>
                                    ) : null}
                                    {proposal.resultMessage ? (
                                        <p
                                            role="status"
                                            className={`mt-4 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs leading-5 ${statusTone === 'success' ? 'border-zinc-200 bg-zinc-50 text-zinc-800' : statusTone === 'expired' ? 'border-amber-100 bg-amber-50/80 text-amber-800' : 'border-rose-100 bg-rose-50/80 text-rose-800'}`}
                                        >
                                            {statusTone === 'success' ? (
                                                <Check
                                                    className="mt-0.5 size-3.5 shrink-0"
                                                    aria-hidden="true"
                                                />
                                            ) : statusTone === 'expired' ? (
                                                <Clock3
                                                    className="mt-0.5 size-3.5 shrink-0"
                                                    aria-hidden="true"
                                                />
                                            ) : (
                                                <CircleAlert
                                                    className="mt-0.5 size-3.5 shrink-0"
                                                    aria-hidden="true"
                                                />
                                            )}
                                            {proposal.resultMessage}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
            {pendingIds.length > 1 ? (
                <div className="flex flex-col gap-3 border-t border-zinc-100 bg-zinc-50/80 px-4 py-3 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                        {selected.length} đề xuất được chọn · mỗi dòng được xử
                        lý độc lập
                    </span>
                    <Button
                        type="button"
                        size="sm"
                        disabled={
                            !selected.length ||
                            selected.some((proposal) => proposal.isConfirming)
                        }
                        onClick={() => onConfirm(selected)}
                    >
                        Xác nhận các dòng đã chọn
                    </Button>
                </div>
            ) : null}
        </section>
    );
}
