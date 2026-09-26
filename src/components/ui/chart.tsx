// Wrapper chart tối thiểu dùng chung cho các biểu đồ Recharts trong design system.

'use client';

import * as React from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export function ChartContainer({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={cn('h-[280px] w-full', className)}>
            <ResponsiveContainer width="100%" height="100%">
                {children as React.ReactElement}
            </ResponsiveContainer>
        </div>
    );
}
