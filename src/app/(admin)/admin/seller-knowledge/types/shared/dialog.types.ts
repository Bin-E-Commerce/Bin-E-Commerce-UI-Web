// Props dùng chung cho dialog trong feature, giữ nội dung và điều khiển thuộc component gọi.

import type { ReactNode } from 'react';

export interface KnowledgeDialogProps {
    open: boolean;
    width?: 'compact' | 'wide';
    title: string;
    description: string;
    children: ReactNode;
    footer: ReactNode;
    onOpenChange: (open: boolean) => void;
}
