'use client';

// File này quản lý trạng thái request AI, chống gửi trùng và thông báo lỗi/thành công cho editor.
// Hook không biết cách render card hay cập nhật form name; component bên ngoài quyết định giao diện và thời điểm áp dụng.

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { productContentAiService } from '@/services/ai';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type {
    ProductNameSuggestionsRequest,
    ProductNameSuggestionsResponse,
} from '@/services/ai';

// Gọi một lần theo thao tác chủ động của seller; mutation không retry để tránh phát sinh chi phí LLM ngoài ý muốn.
export function useProductNameSuggestions() {
    const mutation = useMutation<ProductNameSuggestionsResponse, unknown, ProductNameSuggestionsRequest>({
        mutationFn: productContentAiService.generateProductNameSuggestions,
        retry: false,
        onSuccess: (result) => {
            toast.success('AI đã tạo 3 tên sản phẩm để bạn lựa chọn.');
            if (result.warnings.length > 0) {
                toast.warning('AI đã loại bỏ một số thông tin nhạy cảm khỏi đề xuất.');
            }
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });

    // Không expose mutate trực tiếp để component không thể vô tình gửi lại khi request hiện tại chưa hoàn tất.
    const generate = (payload: ProductNameSuggestionsRequest) => {
        if (mutation.isPending) return;
        mutation.mutate(payload);
    };

    return {
        generate,
        suggestions: mutation.data?.suggestions ?? [],
        warnings: mutation.data?.warnings ?? [],
        isLoading: mutation.isPending,
        error: mutation.error,
        errorMessage: mutation.error ? getErrorMessage(mutation.error) : undefined,
    };
}
