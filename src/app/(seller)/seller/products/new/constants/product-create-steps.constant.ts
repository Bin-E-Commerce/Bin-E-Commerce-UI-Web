import type { ProductCreateStepDefinition } from '../types/product-create-step.type';

export const PRODUCT_CREATE_STEPS = [
    {
        id: 'basic',
        label: 'Thông tin cơ bản',
        description: 'Ảnh, video, tên và ngành hàng giúp khách nhận diện sản phẩm.',
    },
    {
        id: 'details',
        label: 'Thông tin chi tiết',
        description: 'Thương hiệu, thuộc tính ngành hàng và mô tả sản phẩm.',
    },
    {
        id: 'sales',
        label: 'Thông tin bán hàng',
        description: 'Phân loại, giá bán, SKU và số lượng tồn kho.',
    },
    {
        id: 'shipping',
        label: 'Vận chuyển',
        description: 'Kích thước và cân nặng đóng gói để tính phương án giao hàng.',
    },
    {
        id: 'other',
        label: 'Thông tin khác',
        description: 'Tình trạng, xuất xứ và mã nhận diện bổ sung.',
    },
] satisfies ProductCreateStepDefinition[];
