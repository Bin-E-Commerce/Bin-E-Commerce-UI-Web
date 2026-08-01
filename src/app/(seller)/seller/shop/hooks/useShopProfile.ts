'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { catalogService } from '@/services/catalog';
import {
    shopProfileService,
    type ShopProfileDto,
} from '@/services/seller';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
    shopProfileSchema,
    type ShopProfileFormValues,
} from '../schemas/shop-profile.schema';

const SHOP_PROFILE_QUERY_KEY = ['seller', 'shop-profile'] as const;

// Quản lý cache hồ sơ, danh mục tham chiếu và trạng thái form trong một nơi để component chỉ tập trung trình bày.
export function useShopProfile() {
    const queryClient = useQueryClient();
    const [editing, setEditing] = useState(false);
    const profileQuery = useQuery({
        queryKey: SHOP_PROFILE_QUERY_KEY,
        queryFn: shopProfileService.getMine,
        staleTime: 60_000,
    });
    const categoriesQuery = useQuery({
        queryKey: ['catalog', 'categories', 'shop-profile'],
        queryFn: () =>
            catalogService.listCategories({
                page: 1,
                pageSize: 200,
            }),
        staleTime: 10 * 60_000,
    });
    const form = useForm<ShopProfileFormValues>({
        resolver: zodResolver(shopProfileSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            description: '',
            logoUrl: '',
            contactEmail: '',
            contactPhone: '',
        },
    });

    useEffect(() => {
        if (!profileQuery.data) return;
        form.reset(toFormValues(profileQuery.data));
    }, [form, profileQuery.data]);

    const updateMutation = useMutation({
        mutationFn: shopProfileService.updateMine,
        onSuccess: (profile) => {
            queryClient.setQueryData(SHOP_PROFILE_QUERY_KEY, profile);
            form.reset(toFormValues(profile));
            setEditing(false);
            toast.success('Đã cập nhật hồ sơ shop.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });

    // Mở chế độ chỉnh sửa từ dữ liệu cache mới nhất để thao tác hủy luôn khôi phục đúng snapshot đang hiển thị.
    const startEditing = () => {
        if (profileQuery.data) {
            form.reset(toFormValues(profileQuery.data));
        }
        setEditing(true);
    };

    // Hủy toàn bộ thay đổi cục bộ mà không phát request cập nhật lên backend.
    const cancelEditing = () => {
        if (profileQuery.data) {
            form.reset(toFormValues(profileQuery.data));
        }
        setEditing(false);
    };

    // Chỉ gửi form sau khi React Hook Form và Zod xác nhận cùng contract với DTO backend.
    const submit = form.handleSubmit((values) => {
        updateMutation.mutate(values);
    });

    const categoryName =
        categoriesQuery.data?.items.find(
            (category) =>
                category.id === profileQuery.data?.shop.mainCategoryId,
        )?.name ?? 'Chưa xác định';

    return {
        profileQuery,
        categoriesQuery,
        form,
        editing,
        categoryName,
        updateMutation,
        startEditing,
        cancelEditing,
        submit,
    };
}

// Ánh xạ DTO thành form values phẳng để schema chỉnh sửa không phụ thuộc cấu trúc response ba tab.
function toFormValues(profile: ShopProfileDto): ShopProfileFormValues {
    return {
        name: profile.shop.name,
        description: profile.shop.description ?? '',
        logoUrl: profile.shop.logoUrl,
        contactEmail: profile.shop.contactEmail,
        contactPhone: profile.shop.contactPhone,
    };
}
