import { Tags } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { CATEGORY_ICON_RULES } from '../constants/category-icon-rules.constant';

// Chọn icon gần với tên ngành hàng và dùng icon nhãn làm fallback cho dữ liệu mới chưa có luật riêng.
export function getCategoryIcon(categoryName: string): LucideIcon {
    return (
        CATEGORY_ICON_RULES.find(({ pattern }) => pattern.test(categoryName))
            ?.icon ?? Tags
    );
}
