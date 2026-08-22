import { z } from 'zod';

import {
    optionalUuidSelectionSchema,
    uuidSelectionSchema,
} from '@/lib/validation/common-validation.schema';

// Kiểm tra GTIN khi người bán thật sự khai báo mã nhận diện sản phẩm.
const optionalGtinSchema = z.string().trim().refine(
    (value) => value.length === 0 || /^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(value),
    'GTIN phải gồm 8, 12, 13 hoặc 14 chữ số.',
);

// Giữ số ở dạng chuỗi trong form để người dùng có thể nhập dở và hiển thị lỗi đúng vị trí.
const positiveNumberText = (label: string) =>
    z
        .string()
        .trim()
        .min(1, `${label} là bắt buộc.`)
        .refine(
            (value) => Number.isFinite(Number(value)) && Number(value) > 0,
            { message: `${label} phải lớn hơn 0.` },
        );

// Xác thực toàn bộ dữ liệu trước khi mapper chuyển form thành payload tạo sản phẩm.
export const sellerProductCreateSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(20, 'Tên sản phẩm cần có ít nhất 20 ký tự.')
            .max(200, 'Tên sản phẩm không được vượt quá 200 ký tự.'),
        // Các ID này đến từ Catalog Service và có thể là UUID v5 sau khi import dữ liệu.
        // FE chỉ kiểm tra UUID hợp lệ; việc ID có tồn tại và thuộc catalog nào do backend quyết định.
        categoryId: uuidSelectionSchema('Vui lòng chọn ngành hàng cấp cuối.'),
        // Brand là tùy chọn theo CreateSellerProductDto; để trống vẫn hợp lệ,
        // còn nếu seller chọn thì ID bắt buộc phải là UUID của Catalog Service.
        brandId: optionalUuidSelectionSchema('Thương hiệu không hợp lệ.'),
        description: z
            .string()
            .trim()
            .min(20, 'Mô tả sản phẩm cần có ít nhất 20 ký tự.')
            .max(30_000, 'Mô tả sản phẩm không được vượt quá 30.000 ký tự.'),
        shortDescription: z.string().trim().max(500, 'Mô tả ngắn không được vượt quá 500 ký tự.'),
        gtin: optionalGtinSchema,
        sellerSku: z.string().trim().max(160, 'SKU sản phẩm không được vượt quá 160 ký tự.'),
        condition: z.enum(['new', 'used_like_new', 'used_good']),
        countryOfOrigin: z.string().trim().max(120, 'Xuất xứ không được vượt quá 120 ký tự.'),
        images: z
            .array(
                z.object({
                    assetId: z.string().min(1),
                    publicUrl: z.url(),
                    previewUrl: z.string().min(1),
                    fileName: z.string().min(1),
                }),
            )
            .min(2, 'Tải lên ít nhất 2 hình ảnh sản phẩm.')
            .max(9, 'Một sản phẩm chỉ được có tối đa 9 ảnh.'),
        video: z
            .object({
                // Media Service cũng có thể trả asset UUID không phải phiên bản v4.
                assetId: uuidSelectionSchema('Video không hợp lệ.'),
                publicUrl: z.url(),
                previewUrl: z.string().min(1),
                fileName: z.string().min(1),
                durationSeconds: z.number().int().min(10).max(60),
            })
            .nullable(),
        attributes: z.record(
            z.string(),
            z.object({
                // Product Service lưu liên kết option bằng UUID; chặn sớm mọi clientId hoặc giá trị giả.
                // Chỉ gửi ID option từ Catalog, tuyệt đối không gửi nhãn hiển thị.
                selectedOptionIds: z.array(
                    uuidSelectionSchema('Giá trị thuộc tính không hợp lệ.'),
                ),
                valueText: z.string(),
                valueNumber: z.string(),
                valueBoolean: z.boolean().nullable(),
            }),
        ),
        options: z
            .array(
                z.object({
                    clientId: z.string().min(1),
                    name: z.string().trim().min(1, 'Tên nhóm phân loại là bắt buộc.'),
                    values: z
                        .array(
                            z.object({
                                clientId: z.string().min(1),
                                value: z.string().trim().min(1, 'Giá trị phân loại không được để trống.'),
                            }),
                        )
                        .min(1, 'Mỗi nhóm cần ít nhất một giá trị.')
                        .max(20),
                }),
            )
            .max(2, 'Sản phẩm chỉ hỗ trợ tối đa hai nhóm phân loại.'),
        variants: z
            .array(
                z.object({
                    key: z.string().min(1),
                    label: z.string(),
                    optionValueClientIds: z.array(z.string()).max(2),
                    sku: z.string().trim().max(160),
                    gtin: optionalGtinSchema,
                    withoutGtin: z.boolean(),
                    price: z.string().trim().refine(
                        (value) => Number.isFinite(Number(value)) && Number(value) >= 100,
                        'Giá bán phải từ 100 đồng.',
                    ),
                    originalPrice: z.string().trim(),
                    stockQuantity: z.string().trim().refine(
                        (value) => Number.isInteger(Number(value)) && Number(value) >= 0,
                        'Tồn kho phải là số nguyên không âm.',
                    ),
                    imageUrl: z.string(),
                }),
            )
            .min(1),
        package: z.object({
            weightGrams: positiveNumberText('Cân nặng đóng gói'),
            lengthCm: positiveNumberText('Chiều dài'),
            widthCm: positiveNumberText('Chiều rộng'),
            heightCm: positiveNumberText('Chiều cao'),
        }),
    })
    .superRefine((values, context) => {
        values.variants.forEach((variant, index) => {
            const price = Number(variant.price);
            const originalPrice = Number(variant.originalPrice);

            // Giá gốc chỉ hợp lệ khi không thấp hơn giá bán để tránh hiển thị giảm giá sai.
            if (variant.originalPrice && (!Number.isFinite(originalPrice) || originalPrice < price)) {
                context.addIssue({
                    code: 'custom',
                    path: ['variants', index, 'originalPrice'],
                    message: 'Giá gốc phải lớn hơn hoặc bằng giá bán.',
                });
            }

            // Khi không dùng GTIN chung, từng SKU phải có mã riêng hoặc được đánh dấu không có GTIN.
            if (!values.gtin && !variant.gtin && !variant.withoutGtin) {
                context.addIssue({
                    code: 'custom',
                    path: ['variants', index, 'gtin'],
                    message: 'Nhập GTIN hoặc chọn không có GTIN.',
                });
            }
        });
    });

// Giá trị ban đầu dùng chung cho lần tạo sản phẩm mới, giúp form và preview luôn có đủ cấu trúc.
export const initialSellerProductCreateValues = {
    name: '',
    categoryId: '',
    brandId: '',
    description: '',
    shortDescription: '',
    gtin: '',
    sellerSku: '',
    condition: 'new' as const,
    countryOfOrigin: '',
    images: [],
    video: null,
    attributes: {},
    options: [],
    variants: [{
        key: 'default',
        label: 'Sản phẩm mặc định',
        optionValueClientIds: [],
        sku: '',
        gtin: '',
        withoutGtin: true,
        price: '',
        originalPrice: '',
        stockQuantity: '0',
        imageUrl: '',
    }],
    package: { weightGrams: '', lengthCm: '', widthCm: '', heightCm: '' },
};
