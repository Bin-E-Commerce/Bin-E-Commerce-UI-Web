import { z } from 'zod';

const requestNoteSchema = z
    .string()
    .trim()
    .min(10, 'Vui lòng mô tả lý do thay đổi ít nhất 10 ký tự.')
    .max(500, 'Lý do thay đổi tối đa 500 ký tự.');

export const shopTaxChangeSchema = z.object({
    legalName: z
        .string()
        .trim()
        .min(2, 'Tên pháp lý cần ít nhất 2 ký tự.')
        .max(180),
    taxCode: z
        .string()
        .trim()
        .regex(/^(\d{10}|\d{13})$/, 'Mã số thuế cần gồm 10 hoặc 13 số.'),
    invoiceEmail: z.string().trim().email('Email nhận hóa đơn không hợp lệ.'),
    requestNote: requestNoteSchema,
});

export const shopPayoutChangeSchema = z.object({
    bankCode: z.string().trim().min(1, 'Vui lòng chọn ngân hàng.'),
    bankName: z.string().trim().min(2, 'Tên ngân hàng không hợp lệ.').max(120),
    accountNumber: z
        .string()
        .trim()
        .regex(/^\d{6,30}$/, 'Số tài khoản cần gồm 6 đến 30 số.'),
    accountHolderName: z
        .string()
        .trim()
        .min(2, 'Tên chủ tài khoản cần ít nhất 2 ký tự.')
        .max(180),
    accountType: z.enum(['personal', 'business']),
    branch: z.string().trim().max(160, 'Chi nhánh tối đa 160 ký tự.'),
    requestNote: requestNoteSchema,
});

const verificationDocumentSchema = z.object({
    assetId: z.string().min(1),
    url: z.string().url(),
    fileName: z.string().min(1),
    contentType: z.string().min(1),
    uploadedAt: z.string().min(1),
});

export const shopIdentityChangeSchema = z
    .object({
        profileType: z.enum(['individual', 'business']),
        legalName: z
            .string()
            .trim()
            .min(2, 'Tên pháp lý cần ít nhất 2 ký tự.')
            .max(180),
        citizenId: z.string().trim(),
        representativeName: z
            .string()
            .trim()
            .min(2, 'Tên người đại diện cần ít nhất 2 ký tự.')
            .max(160),
        representativeRole: z.string().trim().max(120),
        contactEmail: z.string().trim().email('Email liên hệ không hợp lệ.'),
        contactPhone: z
            .string()
            .trim()
            .regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại liên hệ không hợp lệ.'),
        documents: z.record(z.string(), verificationDocumentSchema),
        requestNote: requestNoteSchema,
    })
    .superRefine((value, context) => {
        // Hồ sơ cá nhân phải nộp lại đủ hai mặt CCCD để admin đối chiếu toàn bộ bộ giấy tờ mới.
        if (value.profileType === 'individual') {
            requireDocument(
                value.documents,
                'citizenIdFront',
                'Vui lòng tải CCCD mặt trước.',
                context,
            );
            requireDocument(
                value.documents,
                'citizenIdBack',
                'Vui lòng tải CCCD mặt sau.',
                context,
            );
            if (!/^(\d{9}|\d{12})$/.test(value.citizenId)) {
                context.addIssue({
                    code: 'custom',
                    path: ['citizenId'],
                    message: 'Số CCCD cần gồm 9 hoặc 12 số.',
                });
            }
        }

        // Hồ sơ doanh nghiệp cần giấy phép và giấy tờ đại diện thay cho cặp ảnh CCCD cá nhân.
        if (value.profileType === 'business') {
            requireDocument(
                value.documents,
                'businessLicense',
                'Vui lòng tải giấy đăng ký kinh doanh.',
                context,
            );
            requireDocument(
                value.documents,
                'representativeDocument',
                'Vui lòng tải giấy tờ người đại diện.',
                context,
            );
        }
    });

export type ShopTaxChangeFormValues = z.infer<typeof shopTaxChangeSchema>;
export type ShopPayoutChangeFormValues = z.infer<typeof shopPayoutChangeSchema>;
export type ShopIdentityChangeFormValues = z.infer<
    typeof shopIdentityChangeSchema
>;

// Gắn lỗi vào đúng card tài liệu để người dùng biết ảnh nào còn thiếu.
function requireDocument(
    documents: Record<string, z.infer<typeof verificationDocumentSchema>>,
    key: string,
    message: string,
    context: z.RefinementCtx,
) {
    if (!documents[key]?.url) {
        context.addIssue({
            code: 'custom',
            path: ['documents', key],
            message,
        });
    }
}
