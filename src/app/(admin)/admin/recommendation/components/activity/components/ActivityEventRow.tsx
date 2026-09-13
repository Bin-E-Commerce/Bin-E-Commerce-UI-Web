// Một dòng trong hành trình recommendation, ghép nhãn event với sản phẩm và ngữ cảnh attribution.

import { PackageOpen } from 'lucide-react';
import Image from 'next/image';

import type { ActivityItem } from '../types';
import { formatActivityDate, getInteractionMeta, getReadableValue } from '../activity.utils';

interface Props {
    item: ActivityItem;
}

// Hiển thị event theo thông tin dễ hiểu; mã sản phẩm/request không chiếm chỗ trong bảng chính.
export function ActivityEventRow({ item }: Props) {
    const interaction = getInteractionMeta(item.interactionType);
    const Icon = interaction.icon;
    const productName = item.productName ?? 'Sản phẩm không còn trong catalog';

    return (
        <tr className="transition-colors hover:bg-zinc-50/60">
            <td className="px-5 py-3.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-950">
                    <Icon className="size-3.5 text-zinc-400" />
                    {interaction.label}
                </span>
            </td>
            <td className="max-w-[18rem] px-3 py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                        {item.productImageUrl ? (
                            <Image
                                src={item.productImageUrl}
                                alt=""
                                fill
                                sizes="40px"
                                className="object-contain"
                            />
                        ) : (
                            <PackageOpen className="size-4 text-zinc-300" />
                        )}
                    </div>
                    <span
                        className="line-clamp-2 text-xs font-medium leading-5 text-zinc-800"
                        title={productName}
                    >
                        {productName}
                    </span>
                </div>
            </td>
            <td className="whitespace-nowrap px-3 py-3.5 text-xs text-zinc-600">
                <span>{getReadableValue(item.recommendationSource, 'Không xác định')}</span>
                {item.recommendationRank ? (
                    <span className="ml-1 text-zinc-400">#{item.recommendationRank}</span>
                ) : null}
            </td>
            <td className="whitespace-nowrap px-3 py-3.5 text-xs text-zinc-600">
                {getReadableValue(item.surface, '—')}
            </td>
            <td className="whitespace-nowrap px-5 py-3.5 text-xs text-zinc-500">
                {formatActivityDate(item.occurredAt)}
            </td>
        </tr>
    );
}
