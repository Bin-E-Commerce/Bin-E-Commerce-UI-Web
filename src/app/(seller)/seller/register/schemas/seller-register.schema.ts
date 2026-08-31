import { z } from 'zod';

import {
    requiredAbsoluteUrlSchema,
    SHOP_SLUG_PATTERN,
    trimmedStringSchema,
    uuidSelectionSchema,
    vietnamPhoneSchema,
} from '@/lib/validation/common-validation.schema';

export type SellerRegisterFieldErrors = Partial<Record<string, string>>;

const BUSINESS_MODELS = new Set(['retail', 'brand', 'distributor']);
const ACCOUNT_TYPES = ['personal', 'business'] as const;
const PROFILE_TYPES = ['individual', 'business'] as const;

const sellerDocumentSchema = z.object({
    assetId: z.string().min(1),
    url: z.string().url(),
    fileName: z.string().min(1),
    contentType: z.string().min(1),
    uploadedAt: z.string().min(1),
});

const shopSchema = z.object({
    name: trimmedStringSchema({
        min: 3,
        max: 120,
        minMessage: 'Tên shop cần từ 3 đến 120 ký tự.',
        maxMessage: 'Tên shop cần từ 3 đến 120 ký tự.',
    }),
    slug: z
        .string()
        .trim()
        .min(3, 'Đường dẫn shop cần từ 3 đến 140 ký tự.')
        .max(140, 'Đường dẫn shop cần từ 3 đến 140 ký tự.')
        .regex(
            SHOP_SLUG_PATTERN,
            'Chỉ dùng chữ thường, số và dấu gạch ngang giữa các từ.',
        ),
    mainCategoryId: uuidSelectionSchema('Vui lòng chọn ngành hàng chính.'),
    businessModel: z
        .string()
        .refine(
            (value) => BUSINESS_MODELS.has(value),
            'Vui lòng chọn mô hình bán hàng hợp lệ.',
        ),
    description: z.string().trim().max(1000, 'Mô tả shop tối đa 1000 ký tự.'),
    logoUrl: requiredAbsoluteUrlSchema(
        'Vui lòng tải logo shop.',
        'Logo shop phải là đường dẫn URL hợp lệ.',
    ),
});

const sellerInfoSchema = z
    .object({
        profileType: z.enum(PROFILE_TYPES),
        legalName: trimmedStringSchema({
            min: 2,
            max: 180,
            minMessage: 'Tên hồ sơ cần từ 2 đến 180 ký tự.',
            maxMessage: 'Tên hồ sơ cần từ 2 đến 180 ký tự.',
        }),
        citizenId: z.string().trim(),
        taxCode: z.string().trim(),
        representativeName: trimmedStringSchema({
            min: 2,
            max: 160,
            minMessage: 'Người đại diện cần từ 2 đến 160 ký tự.',
            maxMessage: 'Người đại diện cần từ 2 đến 160 ký tự.',
        }),
        representativeRole: z
            .string()
            .trim()
            .max(120, 'Chức vụ / vai trò tối đa 120 ký tự.'),
        phone: vietnamPhoneSchema('Số điện thoại người bán không hợp lệ.'),
        email: z.string().trim().email('Email liên hệ không hợp lệ.'),
        documents: z.record(z.string(), sellerDocumentSchema),
    })
    .superRefine((value, ctx) => {
        // Cá nhân dùng CCCD, doanh nghiệp dùng mã số thuế; kiểm tra ở FE để người dùng sửa ngay tại bước nhập.
        if (
            value.profileType === 'business' &&
            !/^(\d{10}|\d{13})$/.test(value.taxCode)
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['taxCode'],
                message: 'Mã số thuế cần gồm 10 hoặc 13 số.',
            });
        }

        if (
            value.profileType === 'individual' &&
            !/^(\d{9}|\d{12})$/.test(value.citizenId)
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['citizenId'],
                message: 'Số CCCD cần gồm 9 hoặc 12 số.',
            });
        }

        // Hồ sơ cá nhân phải có đủ hai mặt CCCD để admin đối chiếu trực tiếp trên trang chi tiết.
        if (value.profileType === 'individual') {
            requireDocument(
                value.documents,
                'citizenIdFront',
                'Vui lòng tải ảnh CCCD mặt trước.',
                ctx,
            );
            requireDocument(
                value.documents,
                'citizenIdBack',
                'Vui lòng tải ảnh CCCD mặt sau.',
                ctx,
            );
        }

        // Hồ sơ doanh nghiệp cần giấy phép và giấy tờ người đại diện để kiểm tra pháp nhân.
        if (value.profileType === 'business') {
            requireDocument(
                value.documents,
                'businessLicense',
                'Vui lòng tải giấy đăng ký kinh doanh.',
                ctx,
            );
            requireDocument(
                value.documents,
                'representativeDocument',
                'Vui lòng tải giấy tờ người đại diện.',
                ctx,
            );
        }
    });

const pickupAddressSchema = z.object({
    contactName: trimmedStringSchema({
        min: 2,
        max: 160,
        minMessage: 'Người phụ trách cần từ 2 đến 160 ký tự.',
        maxMessage: 'Người phụ trách cần từ 2 đến 160 ký tự.',
    }),
    phone: vietnamPhoneSchema('Số điện thoại lấy hàng không hợp lệ.'),
    provinceId: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố.'),
    provinceName: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố.'),
    districtId: z.string().min(1, 'Vui lòng chọn quận/huyện.'),
    districtName: z.string().min(1, 'Vui lòng chọn quận/huyện.'),
    wardCode: z.string().min(1, 'Vui lòng chọn phường/xã.'),
    wardName: z.string().min(1, 'Vui lòng chọn phường/xã.'),
    addressLine: z
        .string()
        .trim()
        .min(1, 'Vui lòng nhập địa chỉ lấy hàng chi tiết.')
        .max(500, 'Địa chỉ chi tiết tối đa 500 ký tự.'),
});

const payoutSchema = z.object({
    bankCode: z
        .string()
        .trim()
        .min(1, 'Vui lòng chọn ngân hàng nhận thanh toán.')
        .max(60, 'Vui lòng chọn ngân hàng nhận thanh toán.'),
    bankName: trimmedStringSchema({
        min: 2,
        max: 120,
        minMessage: 'Tên ngân hàng cần từ 2 đến 120 ký tự.',
        maxMessage: 'Tên ngân hàng cần từ 2 đến 120 ký tự.',
    }),
    accountNumber: z
        .string()
        .trim()
        .regex(/^\d{6,30}$/, 'Số tài khoản cần gồm 6 đến 30 số.'),
    accountHolderName: trimmedStringSchema({
        min: 2,
        max: 180,
        minMessage: 'Tên chủ tài khoản cần từ 2 đến 180 ký tự.',
        maxMessage: 'Tên chủ tài khoản cần từ 2 đến 180 ký tự.',
    }),
    accountType: z
        .enum(ACCOUNT_TYPES)
        .refine(Boolean, 'Vui lòng chọn loại tài khoản hợp lệ.'),
    branch: z.string().trim().max(160, 'Chi nhánh / khu vực tối đa 160 ký tự.'),
});

export const sellerRegisterSchema = z.object({
    shop: shopSchema,
    seller: sellerInfoSchema,
    pickupAddress: pickupAddressSchema,
    payout: payoutSchema,
    acceptedTerms: z
        .boolean()
        .refine(
            (value) => value,
            'Vui lòng xác nhận thông tin trước khi gửi hồ sơ.',
        ),
});

export const initialSellerRegisterValues = {
    shop: {
        name: '',
        slug: '',
        mainCategoryId: '',
        businessModel: 'retail',
        description: '',
        logoUrl: '',
    },
    seller: {
        profileType: 'individual',
        legalName: '',
        citizenId: '',
        taxCode: '',
        representativeName: '',
        representativeRole: '',
        phone: '',
        email: '',
        documents: {},
    },
    pickupAddress: {
        contactName: '',
        phone: '',
        provinceId: '',
        provinceName: '',
        districtId: '',
        districtName: '',
        wardCode: '',
        wardName: '',
        addressLine: '',
    },
    payout: {
        bankCode: '',
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        accountType: 'personal',
        branch: '',
    },
    acceptedTerms: false,
} satisfies z.input<typeof sellerRegisterSchema>;

const sellerRegisterStepSchemas = [
    z.object({ shop: shopSchema }),
    z.object({ seller: sellerInfoSchema }),
    z.object({ pickupAddress: pickupAddressSchema }),
    z.object({ payout: payoutSchema }),
    sellerRegisterSchema,
] as const;

// Dùng để validate từng bước, FE sẽ không validate các field ngoài step hiện tại.
export const SELLER_REGISTER_STEP_FIELD_PATHS = [
    [
        'shop.name',
        'shop.slug',
        'shop.mainCategoryId',
        'shop.businessModel',
        'shop.description',
        'shop.logoUrl',
    ],
    [
        'seller.profileType',
        'seller.legalName',
        'seller.citizenId',
        'seller.taxCode',
        'seller.representativeName',
        'seller.representativeRole',
        'seller.phone',
        'seller.email',
        'seller.documents',
    ],
    [
        'pickupAddress.contactName',
        'pickupAddress.phone',
        'pickupAddress.provinceId',
        'pickupAddress.districtId',
        'pickupAddress.wardCode',
        'pickupAddress.addressLine',
    ],
    [
        'payout.bankCode',
        'payout.bankName',
        'payout.accountNumber',
        'payout.accountHolderName',
        'payout.accountType',
        'payout.branch',
    ],
    ['acceptedTerms'],
] as const;

export interface StepValidationResult {
    valid: boolean;
    message: string;
    errors: SellerRegisterFieldErrors;
}

// Kiểm tra từng bước bằng Zod để rule FE bám sát DTO của seller-service.
export function validateSellerRegisterStep(
    values: z.input<typeof sellerRegisterSchema>,
    step: number,
): StepValidationResult {
    const schema = sellerRegisterStepSchemas[step] ?? sellerRegisterSchema;
    const result = schema.safeParse(values);

    if (result.success) {
        return { valid: true, message: '', errors: {} };
    }

    const errors = flattenZodIssues(result.error.issues);
    const firstMessage = Object.values(errors)[0] ?? '';

    return {
        valid: false,
        message: firstMessage,
        errors,
    };
}

// Thêm lỗi đúng vào từng document key để card upload hiển thị lỗi ngay bên dưới ô thiếu ảnh.
function requireDocument(
    documents: Record<string, z.infer<typeof sellerDocumentSchema>>,
    key: string,
    message: string,
    ctx: z.RefinementCtx,
) {
    if (!documents[key]?.url) {
        ctx.addIssue({
            code: 'custom',
            path: ['documents', key],
            message,
        });
    }
}

// Chuyển issue path của Zod thành dạng dot-path đang được các Field component sử dụng.
function flattenZodIssues(issues: z.ZodIssue[]): SellerRegisterFieldErrors {
    return issues.reduce<SellerRegisterFieldErrors>((errors, issue) => {
        const key = issue.path.join('.');
        if (key && !errors[key]) {
            errors[key] = issue.message;
        }

        return errors;
    }, {});
}
