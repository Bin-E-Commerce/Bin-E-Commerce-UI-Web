'use client';

// File này quản lý request tạo mô tả, trạng thái loading/lỗi và toast; component chỉ quyết định cách hiển thị.
// Hook không tự submit form và không sửa bất kỳ field nào của seller ngoài hành động apply do component gọi.

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { productContentAiService } from '@/services/ai';
import type {
    ProductDescriptionSuggestionsRequest,
    ProductDescriptionSuggestionsResponse,
} from '@/services/ai';
import { getErrorMessage } from '@/utils/getErrorMessage';

// Gọi provider tối đa một mutation tại một thời điểm và tắt retry để tránh phát sinh chi phí ngoài ý muốn.
export function useProductDescriptionSuggestions() {
    const mutation = useMutation<
        ProductDescriptionSuggestionsResponse,
        unknown,
        ProductDescriptionSuggestionsRequest
    >({
        mutationFn: productContentAiService.generateProductDescriptionSuggestions,
        retry: false,
        onSuccess: (result) => {
            toast.success('AI đã tạo bản mô tả để bạn kiểm tra.');
            if (result.warnings.length > 0) {
                toast.warning('AI đã loại bỏ một số thông tin không phù hợp khỏi mô tả.');
            }
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });

    // Chặn click lặp trong lúc request đang chạy để không nhân đôi lượt gọi LLM.
    const generate = (payload: ProductDescriptionSuggestionsRequest) => {
        if (mutation.isPending) return;
        mutation.mutate(payload);
    };

    return {
        generate,
        description: mutation.data?.description ?? '',
        warnings: mutation.data?.warnings ?? [],
        isLoading: mutation.isPending,
        errorMessage: mutation.error ? getErrorMessage(mutation.error) : undefined,
    };
}
