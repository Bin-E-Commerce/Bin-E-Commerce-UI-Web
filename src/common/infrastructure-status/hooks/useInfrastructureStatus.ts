// Hook đọc trạng thái hạ tầng từ provider dùng chung; không tự gọi API hoặc tạo timer riêng.

'use client';

import { useContext } from 'react';

import { InfrastructureStatusContext } from '../context/InfrastructureStatusContext';

// Trả về trạng thái popup hạ tầng để các popup khác có thể tuân thủ thứ tự ưu tiên toàn cục.
export function useInfrastructureStatus() {
    const context = useContext(InfrastructureStatusContext);

    if (!context) {
        throw new Error(
            'useInfrastructureStatus phải được dùng bên trong InfrastructureStatusProvider',
        );
    }

    return context;
}
