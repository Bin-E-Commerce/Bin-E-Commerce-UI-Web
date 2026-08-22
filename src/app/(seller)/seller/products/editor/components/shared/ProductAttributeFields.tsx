'use client';

import type { UseFormReturn } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { CatalogCategoryAttribute } from '@/services/catalog';
import type { SellerProductCreateFormValues } from '../../types/seller-product-create-form.type';
import { isUuid } from '../../utils/product-create-validation';
import { ProductAttributeOptionSelect } from './ProductAttributeOptionSelect';
import { ProductFormField } from './ProductFormField';

interface ProductAttributeFieldsProps {
    form: UseFormReturn<SellerProductCreateFormValues>;
    attributes: CatalogCategoryAttribute[];
    loading: boolean;
}

// Hiển thị thuộc tính Catalog và chỉ mở field điều kiện sau khi option kích hoạt đã được chọn.
// Các option không có UUID bị loại khỏi UI để người dùng không thể chọn dữ liệu mà backend sẽ từ chối.
export function ProductAttributeFields({ form, attributes, loading }: ProductAttributeFieldsProps) {
    const values = form.watch('attributes') ?? {};
    const selectedOptionIds = new Set(
        Object.values(values)
            .flatMap((value) => value?.selectedOptionIds ?? [])
            .filter((optionId) => isUuid(optionId)),
    );
    const visibleAttributes = attributes.filter(
        (attribute) =>
            !attribute.triggerOptionId ||
            !isUuid(attribute.triggerOptionId) ||
            selectedOptionIds.has(attribute.triggerOptionId),
    );

    if (loading) {
        return <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-20 animate-pulse rounded-md bg-zinc-100" />)}</div>;
    }
    if (visibleAttributes.length === 0) {
        return <div className="rounded-md border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-500">Chọn ngành hàng để hiển thị thông số sản phẩm phù hợp.</div>;
    }

    return <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">{visibleAttributes.map((attribute) => <ProductAttributeField key={attribute.id} form={form} attribute={attribute} />)}</div>;
}

interface ProductAttributeFieldProps {
    form: UseFormReturn<SellerProductCreateFormValues>;
    attribute: CatalogCategoryAttribute;
}

// Chọn control theo input type để dữ liệu được ghi đúng kênh giá trị của thuộc tính.
function ProductAttributeField({ form, attribute }: ProductAttributeFieldProps) {
    const value = form.watch(`attributes.${attribute.id}`) ?? { selectedOptionIds: [], valueText: '', valueNumber: '', valueBoolean: null };
    const fieldErrors = form.formState.errors.attributes?.[attribute.id];
    const error = fieldErrors?.selectedOptionIds?.message || fieldErrors?.valueText?.message || fieldErrors?.valueNumber?.message || fieldErrors?.valueBoolean?.message;
    const fieldId = `product-attribute-${attribute.id}`;
    const isOptionField = attribute.inputType === 'SINGLE_SELECT' || attribute.inputType === 'MULTI_SELECT';

    return (
        <ProductFormField
            label={attribute.displayName}
            htmlFor={fieldId}
            required={attribute.isRequired}
            error={typeof error === 'string' ? error : undefined}
            hint={isOptionField && attribute.maxSelections ? `Chọn tối đa ${attribute.maxSelections} giá trị.` : undefined}
        >
            <ProductAttributeInput form={form} attribute={attribute} fieldId={fieldId} />
        </ProductFormField>
    );
}

interface ProductAttributeInputProps extends ProductAttributeFieldProps {
    fieldId: string;
}

// Tách control khỏi layout field để từng kiểu thuộc tính vẫn dễ đọc và giữ đúng dữ liệu mapper cần.
function ProductAttributeInput({ form, attribute, fieldId }: ProductAttributeInputProps) {
    const value = form.watch(`attributes.${attribute.id}`) ?? { selectedOptionIds: [], valueText: '', valueNumber: '', valueBoolean: null };
    const isOptionField = attribute.inputType === 'SINGLE_SELECT' || attribute.inputType === 'MULTI_SELECT';

    if (isOptionField) {
        const validOptions = attribute.options.filter((option) => isUuid(option.id));
        const selectedValidOptionIds = value.selectedOptionIds.filter((optionId) => isUuid(optionId));

        return <ProductAttributeOptionSelect value={selectedValidOptionIds} options={validOptions} multiple={attribute.inputType === 'MULTI_SELECT'} maxSelections={attribute.maxSelections} placeholder={`Chọn ${attribute.displayName.toLocaleLowerCase('vi-VN')}`} onChange={(selectedOptionIds) => setSelectedOptions(form, attribute.id, selectedOptionIds)} />;
    }
    if (attribute.inputType === 'BOOLEAN') {
        return <div className="flex h-11 items-center justify-between rounded-md border border-zinc-200 px-3"><span className="text-sm text-zinc-600">{value.valueBoolean === null ? 'Chưa xác định' : value.valueBoolean ? 'Có' : 'Không'}</span><Switch id={fieldId} checked={value.valueBoolean === true} onCheckedChange={(checked) => form.setValue(`attributes.${attribute.id}.valueBoolean`, checked, { shouldDirty: true, shouldValidate: true })} /></div>;
    }
    if (attribute.inputType === 'TEXTAREA') {
        return <Textarea id={fieldId} rows={3} value={value.valueText} onChange={(event) => form.setValue(`attributes.${attribute.id}.valueText`, event.target.value, { shouldDirty: true, shouldValidate: true })} />;
    }
    return <Input id={fieldId} type={getInputType(attribute.inputType)} step={attribute.inputType === 'DECIMAL' ? 'any' : undefined} value={attribute.inputType === 'INTEGER' || attribute.inputType === 'DECIMAL' ? value.valueNumber : value.valueText} onChange={(event) => setTextAttributeValue(form, attribute, event.target.value)} className="h-11" />;
}

// Lưu option ID thay vì nhãn hiển thị để mapper có khóa ngoại ổn định khi Catalog đổi tên.
function setSelectedOptions(form: UseFormReturn<SellerProductCreateFormValues>, attributeId: string, selectedOptionIds: string[]) {
    // Lọc thêm ở điểm ghi form để dữ liệu không hợp lệ không thể quay lại payload
    // qua một control khác hoặc qua trạng thái cũ của component.
    form.setValue(`attributes.${attributeId}.selectedOptionIds`, selectedOptionIds.filter((optionId) => isUuid(optionId)), { shouldDirty: true, shouldValidate: true });
}

// Ghi text hoặc number vào đúng field mà Catalog định nghĩa.
function setTextAttributeValue(form: UseFormReturn<SellerProductCreateFormValues>, attribute: CatalogCategoryAttribute, value: string) {
    const valueField = attribute.inputType === 'INTEGER' || attribute.inputType === 'DECIMAL' ? 'valueNumber' : 'valueText';
    form.setValue(`attributes.${attribute.id}.${valueField}`, value, { shouldDirty: true, shouldValidate: true });
}

// Chuyển input type Catalog sang HTML input phù hợp.
function getInputType(inputType: CatalogCategoryAttribute['inputType']) {
    if (inputType === 'DATE') return 'date';
    if (inputType === 'DATETIME') return 'datetime-local';
    if (inputType === 'INTEGER' || inputType === 'DECIMAL') return 'number';
    return 'text';
}
