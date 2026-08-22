'use client';

import {
    Combobox,
    ComboboxContent,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import type {
    SellerProductSortBy,
    SellerProductSortOrder,
} from '@/services/product';

interface ProductSortOption {
    id: string;
    label: string;
    sortBy: SellerProductSortBy;
    sortOrder: SellerProductSortOrder;
}

interface SellerProductSortComboboxProps {
    sortBy: SellerProductSortBy;
    sortOrder: SellerProductSortOrder;
    onChange: (
        sortBy: SellerProductSortBy,
        sortOrder: SellerProductSortOrder,
    ) => void;
}

const SORT_OPTIONS: ProductSortOption[] = [
    {
        id: 'updated-desc',
        label: 'Cập nhật gần nhất',
        sortBy: 'updatedAt',
        sortOrder: 'DESC',
    },
    {
        id: 'created-desc',
        label: 'Tạo mới nhất',
        sortBy: 'createdAt',
        sortOrder: 'DESC',
    },
    {
        id: 'name-asc',
        label: 'Tên sản phẩm A-Z',
        sortBy: 'name',
        sortOrder: 'ASC',
    },
    {
        id: 'price-asc',
        label: 'Giá thấp đến cao',
        sortBy: 'minPrice',
        sortOrder: 'ASC',
    },
    {
        id: 'price-desc',
        label: 'Giá cao đến thấp',
        sortBy: 'minPrice',
        sortOrder: 'DESC',
    },
    {
        id: 'sold-desc',
        label: 'Bán chạy nhất',
        sortBy: 'totalSold',
        sortOrder: 'DESC',
    },
];

// Bọc shadcn Combobox cho bộ sắp xếp để tránh native select khác biệt giữa trình duyệt.
export function SellerProductSortCombobox({
    sortBy,
    sortOrder,
    onChange,
}: SellerProductSortComboboxProps) {
    const selectedOption =
        SORT_OPTIONS.find(
            (option) =>
                option.sortBy === sortBy &&
                option.sortOrder === sortOrder,
        ) ?? SORT_OPTIONS[0];

    return (
        <Combobox<ProductSortOption>
            items={SORT_OPTIONS}
            value={selectedOption}
            onValueChange={(option) => {
                if (option) onChange(option.sortBy, option.sortOrder);
            }}
            itemToStringLabel={(option) => option?.label ?? ''}
            itemToStringValue={(option) => option?.id ?? ''}
            isItemEqualToValue={(item, selected) =>
                item.id === selected.id
            }
        >
            <ComboboxInput
                aria-label="Sắp xếp sản phẩm"
                className="h-10 w-full bg-white sm:w-56"
                showClear={false}
            />
            <ComboboxContent>
                <ComboboxList>
                    {(option: ProductSortOption, index: number) => (
                        <ComboboxItem
                            key={option.id}
                            value={option}
                            index={index}
                            className="cursor-pointer px-3 py-2 data-highlighted:bg-zinc-100 data-highlighted:text-zinc-950"
                        >
                            {option.label}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
