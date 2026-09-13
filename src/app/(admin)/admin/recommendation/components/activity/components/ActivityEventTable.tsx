// Bảng event của account đang chọn; việc hiển thị từng record được giao cho ActivityEventRow.

import type { ActivityItem } from '../types';
import { ActivityEventRow } from './ActivityEventRow';

interface Props {
    activity: ActivityItem[];
}

// Render bảng theo thứ tự event từ API, không tự sắp xếp để không làm thay đổi hành trình đã phân trang.
export function ActivityEventTable({ activity }: Props) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-zinc-100 bg-zinc-50/70 text-[11px] uppercase tracking-wide text-zinc-400">
                    <tr>
                        <th className="px-5 py-3 font-medium">Hành động</th>
                        <th className="px-3 py-3 font-medium">Sản phẩm</th>
                        <th className="px-3 py-3 font-medium">Nguồn gợi ý</th>
                        <th className="px-3 py-3 font-medium">Vị trí</th>
                        <th className="px-5 py-3 font-medium">Thời gian</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                    {activity.map((item) => (
                        <ActivityEventRow key={item.eventId} item={item} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
