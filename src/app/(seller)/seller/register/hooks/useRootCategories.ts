'use client';

import { useEffect, useState } from 'react';

import {
    catalogService,
    type CatalogCategory,
} from '@/services/catalog';

interface UseRootCategoriesResult {
    categories: CatalogCategory[];
    loading: boolean;
    error: string | null;
}

// Tải danh mục gốc một lần khi mở form seller để combobox dùng dữ liệu thật từ catalog-service.
export function useRootCategories(): UseRootCategoriesResult {
    const [categories, setCategories] = useState<CatalogCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        // Dùng flag cancelled để tránh setState sau khi component unmount hoặc user rời trang giữa lúc request.
        const loadCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await catalogService.listCategories({
                    pageSize: 200,
                });

                if (!cancelled) {
                    setCategories(response.items);
                }
            } catch {
                if (!cancelled) {
                    setError('Không tải được ngành hàng. Vui lòng kiểm tra catalog-service.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadCategories();

        return () => {
            cancelled = true;
        };
    }, []);

    return { categories, loading, error };
}

