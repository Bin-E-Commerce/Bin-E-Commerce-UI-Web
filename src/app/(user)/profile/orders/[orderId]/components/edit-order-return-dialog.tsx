// Dialog này cho customer cập nhật lý do và bằng chứng trước khi shop tiếp nhận xử lý.

'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { FilePenLine, ImagePlus, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    ImageLightbox,
    ImageLightboxThumbnail,
    type ImageLightboxMedia,
} from '@/common/reviews/components/ImageLightbox';
import { mediaService } from '@/services/media';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { RETURN_REASONS } from '../constants/return-reason.constant';
import type { EditOrderReturnDialogProps } from '../types/returns/order-return-edit-dialog.types';
import { uploadReturnMedia } from '../utils/return-media-upload';

const MAX_RETURN_IMAGES = 5;
const MAX_RETURN_VIDEOS = 1;

// Tạo preview blob cho file mới và thu hồi URL cũ để không giữ tài nguyên sau khi người dùng đổi lựa chọn.
function createLocalMediaPreviews(
    images: File[],
    videos: File[],
): ImageLightboxMedia[] {
    return [
        ...images.map((file, index) => ({
            url: URL.createObjectURL(file),
            type: 'image' as const,
            label: `Ảnh mới ${index + 1}`,
        })),
        ...videos.map((file, index) => ({
            url: URL.createObjectURL(file),
            type: 'video' as const,
            label: `Video mới ${index + 1}`,
        })),
    ];
}

// Đồng bộ request khi mở và cập nhật nội dung trước khi shop duyệt.
// Lý do đổi ý được lưu với evidence rỗng; lỗi sản phẩm vẫn phải giữ ít nhất một ảnh hoặc video.
// Asset tải lên chỉ bị cleanup khi API từ chối để không xóa file đang được request đã lưu tham chiếu.
export function EditOrderReturnDialog({
    open,
    isSubmitting,
    request,
    order,
    onOpenChange,
    onSave,
}: EditOrderReturnDialogProps) {
    const [reason, setReason] =
        useState<NonNullable<EditOrderReturnDialogProps['request']>['reason']>(
            'DAMAGED',
        );
    const [description, setDescription] = useState('');
    const [evidence, setEvidence] = useState<
        NonNullable<EditOrderReturnDialogProps['request']>['evidence']
    >([]);
    const [images, setImages] = useState<File[]>([]);
    const [videos, setVideos] = useState<File[]>([]);
    const [localMedia, setLocalMedia] = useState<ImageLightboxMedia[]>([]);
    const [activeMedia, setActiveMedia] = useState<{
        items: ImageLightboxMedia[];
        index: number;
    } | null>(null);

    // Mở dialog sẽ nạp đúng snapshot; đổi request/version cũng xóa file chưa lưu từ lần mở trước.
    useEffect(() => {
        if (!open || !request) return;
        setReason(request.reason);
        setDescription(request.description ?? '');
        setEvidence(request.evidence ?? []);
        setImages([]);
        setVideos([]);
        setActiveMedia(null);
    }, [open, request]);

    // Blob URL chỉ sống theo file đang chọn; cleanup khi file bị xóa hoặc dialog unmount.
    useEffect(() => {
        const nextMedia = createLocalMediaPreviews(images, videos);
        setLocalMedia(nextMedia);
        return () => {
            nextMedia.forEach((item) => URL.revokeObjectURL(item.url));
        };
    }, [images, videos]);

    if (!request) return null;
    const editableRequest = request;

    const savedMedia: ImageLightboxMedia[] = evidence.map((item, index) => ({
        url: item.url,
        type: item.type,
        label:
            item.type === 'image'
                ? `Ảnh bằng chứng ${index + 1}`
                : `Video bằng chứng ${index + 1}`,
    }));
    const allMedia = [...savedMedia, ...localMedia];
    const selectedItems = order.items.filter((item) =>
        editableRequest.itemIds.includes(item.id),
    );
    const imageCount =
        evidence.filter((item) => item.type === 'image').length + images.length;
    const videoCount =
        evidence.filter((item) => item.type === 'video').length + videos.length;
    const evidenceRequired = reason !== 'CHANGE_OF_MIND';

    // Lưu snapshot hiện tại; chỉ chặn evidence rỗng với lỗi sản phẩm và rollback file mới nếu API từ chối.
    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ): Promise<void> {
        event.preventDefault();
        // Lý do đổi ý không yêu cầu tệp; các lý do lỗi phải có bằng chứng trước khi phát sinh upload.
        if (
            evidenceRequired &&
            evidence.length + images.length + videos.length === 0
        ) {
            toast.error(
                'Vui lòng giữ lại hoặc thêm ít nhất một ảnh/video bằng chứng.',
            );
            return;
        }

        let uploadedAssets: Awaited<
            ReturnType<typeof uploadReturnMedia>
        >['uploadedAssets'] = [];
        try {
            // Upload trước; nếu API từ chối thì xóa các asset vừa tạo.
            const uploaded =
                images.length || videos.length
                    ? await uploadReturnMedia(images, videos)
                    : { evidence: [], uploadedAssets: [] };
            uploadedAssets = uploaded.uploadedAssets;
            await onSave(editableRequest.id, {
                expectedUpdatedAt: editableRequest.updatedAt,
                reason,
                description: description.trim() || undefined,
                evidence: [...evidence, ...uploaded.evidence],
            });

            const retainedAssetIds = new Set(
                evidence.map((item) => item.assetId),
            );
            const removedAssets = editableRequest.evidence
                .filter((item) => !retainedAssetIds.has(item.assetId))
                .map((item) => ({
                    assetId: item.assetId,
                    purpose:
                        item.type === 'image'
                            ? ('return_image' as const)
                            : ('return_video' as const),
                }));
            if (removedAssets.length > 0)
                await mediaService
                    .cleanupUploadedReviewAssets(removedAssets)
                    .catch(() => undefined);
            setDescription('');
            setEvidence([]);
            setImages([]);
            setVideos([]);
            setActiveMedia(null);
            onOpenChange(false);
        } catch (error) {
            if (uploadedAssets.length > 0)
                await mediaService
                    .cleanupUploadedReviewAssets(uploadedAssets)
                    .catch(() => undefined);
            toast.error(getErrorMessage(error));
        }
    }

    // Thêm ảnh trong quota tổng để backend luôn nhận tối đa năm ảnh và một video.
    function handleImageChange(files: FileList | null): void {
        const nextImages = Array.from(files ?? []);
        if (imageCount + nextImages.length > MAX_RETURN_IMAGES) {
            toast.error('Mỗi yêu cầu chỉ được có tối đa 5 ảnh bằng chứng.');
            return;
        }
        setImages((current) => [...current, ...nextImages]);
    }

    // Chỉ cho chọn một video bao gồm cả video đã lưu sẵn trong request.
    function handleVideoChange(files: FileList | null): void {
        const nextVideos = Array.from(files ?? []);
        if (videoCount + nextVideos.length > MAX_RETURN_VIDEOS) {
            toast.error('Mỗi yêu cầu chỉ được có tối đa 1 video bằng chứng.');
            return;
        }
        setVideos((current) => [...current, ...nextVideos]);
    }

    // Xóa file mới theo nhóm mà không ảnh hưởng minh chứng đã lưu.
    function removeLocalMedia(index: number): void {
        const localIndex = index - evidence.length;
        if (localIndex < images.length) {
            setImages((current) =>
                current.filter((_, itemIndex) => itemIndex !== localIndex),
            );
            return;
        }
        const videoIndex = localIndex - images.length;
        setVideos((current) =>
            current.filter((_, itemIndex) => itemIndex !== videoIndex),
        );
    }

    // Đóng dialog thì bỏ file và object URL chưa lưu để lần mở sau luôn nhận snapshot mới.
    function handleDialogOpenChange(nextOpen: boolean): void {
        if (isSubmitting) return;
        if (!nextOpen) {
            setDescription('');
            setEvidence([]);
            setImages([]);
            setVideos([]);
            setActiveMedia(null);
        }
        onOpenChange(nextOpen);
    }

    return (
        <Dialog open={open} onOpenChange={handleDialogOpenChange}>
            <DialogContent className="grid max-h-[90vh] max-w-[calc(100%-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-3xl border-zinc-200 bg-white p-0 shadow-2xl sm:w-[calc(100%_-_2rem)] sm:max-w-2xl">
                <DialogHeader className="border-b border-zinc-100 px-5 py-5 sm:px-7">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700">
                            <FilePenLine
                                className="size-5"
                                aria-hidden="true"
                            />
                        </div>
                        <div className="min-w-0 pr-6">
                            <DialogTitle className="text-lg font-semibold text-zinc-950">
                                Chỉnh sửa yêu cầu hoàn hàng
                            </DialogTitle>
                            <DialogDescription className="mt-1 text-sm leading-5 text-zinc-500">
                                Cập nhật lý do, mô tả hoặc bằng chứng trước khi
                                shop tiếp nhận xử lý.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form
                    id="edit-order-return-form"
                    onSubmit={handleSubmit}
                    className="min-h-0 space-y-5 overflow-y-auto px-5 py-5 sm:px-7"
                >
                    <section className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-zinc-900">
                                    Sản phẩm yêu cầu hoàn
                                </p>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Danh sách sản phẩm đã gửi được giữ nguyên.
                                </p>
                            </div>
                            <span className="shrink-0 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200">
                                {selectedItems.length} sản phẩm
                            </span>
                        </div>
                        <div className="mt-3 space-y-2">
                            {selectedItems.map((item) => (
                                <p
                                    key={item.id}
                                    className="break-words whitespace-normal text-sm text-zinc-700"
                                >
                                    {item.productName}
                                </p>
                            ))}
                        </div>
                    </section>

                    <div className="space-y-2">
                        <label
                            htmlFor="edit-return-reason"
                            className="text-sm font-medium text-zinc-800"
                        >
                            Lý do hoàn hàng
                        </label>
                        <Select
                            value={reason}
                            onValueChange={(value) =>
                                value && setReason(value as typeof reason)
                            }
                        >
                            <SelectTrigger
                                id="edit-return-reason"
                                className="h-11 w-full rounded-xl border-zinc-200 bg-white px-3.5 shadow-sm data-[size=default]:h-12"
                            >
                                <SelectValue>
                                    {RETURN_REASONS.find(
                                        (item) => item.value === reason,
                                    )?.label ??
                                        (reason === 'OTHER'
                                            ? 'Lý do khác (yêu cầu cũ)'
                                            : '')}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="z-[70]">
                                {reason === 'OTHER' ? (
                                    <SelectItem value="OTHER">
                                        Lý do khác (yêu cầu cũ)
                                    </SelectItem>
                                ) : null}
                                {RETURN_REASONS.map((item) => (
                                    <SelectItem
                                        key={item.value}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <label
                                htmlFor="edit-return-description"
                                className="text-sm font-medium text-zinc-800"
                            >
                                Mô tả chi tiết
                            </label>
                            <span className="text-xs text-zinc-400">
                                {description.length}/1000
                            </span>
                        </div>
                        <Textarea
                            id="edit-return-description"
                            value={description}
                            maxLength={1000}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            placeholder="Bổ sung thông tin giúp shop xử lý yêu cầu nhanh hơn"
                            className="min-h-28 resize-y rounded-xl border-zinc-200 bg-white px-3.5 py-3 shadow-sm"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex flex-wrap items-end justify-between gap-2">
                            <div>
                                <p className="text-sm font-medium text-zinc-800">
                                    Ảnh/video bằng chứng{' '}
                                    {evidenceRequired ? (
                                        <span className="text-red-500">*</span>
                                    ) : (
                                        <span className="font-normal text-zinc-500">
                                            (không bắt buộc)
                                        </span>
                                    )}
                                </p>
                                <p className="mt-1 text-xs text-zinc-500">
                                    {evidenceRequired
                                        ? 'Tối đa 5 ảnh và 1 video; cần giữ lại ít nhất một tệp.'
                                        : 'Tối đa 5 ảnh và 1 video nếu bạn muốn bổ sung.'}
                                </p>
                            </div>
                            <span className="text-xs tabular-nums text-zinc-500">
                                {imageCount} ảnh · {videoCount} video
                            </span>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-3 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-500 hover:bg-zinc-100">
                                <ImagePlus
                                    className="size-4"
                                    aria-hidden="true"
                                />{' '}
                                Thêm ảnh
                                <Input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="sr-only"
                                    disabled={
                                        imageCount >= MAX_RETURN_IMAGES ||
                                        isSubmitting
                                    }
                                    onChange={(event) => {
                                        handleImageChange(event.target.files);
                                        event.target.value = '';
                                    }}
                                />
                            </label>
                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-3 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-500 hover:bg-zinc-100">
                                <RotateCcw
                                    className="size-4"
                                    aria-hidden="true"
                                />{' '}
                                Thêm video
                                <Input
                                    type="file"
                                    accept="video/*"
                                    className="sr-only"
                                    disabled={
                                        videoCount >= MAX_RETURN_VIDEOS ||
                                        isSubmitting
                                    }
                                    onChange={(event) => {
                                        handleVideoChange(event.target.files);
                                        event.target.value = '';
                                    }}
                                />
                            </label>
                        </div>
                        {allMedia.length > 0 ? (
                            <div className="flex flex-wrap gap-3 pt-1">
                                {allMedia.map((media, index) => (
                                    <div
                                        key={`${media.url}-${index}`}
                                        className="relative"
                                    >
                                        <ImageLightboxThumbnail
                                            item={media}
                                            onClick={() =>
                                                setActiveMedia({
                                                    items: allMedia,
                                                    index,
                                                })
                                            }
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            aria-label={`Xóa ${media.label}`}
                                            disabled={isSubmitting}
                                            onClick={() => {
                                                if (index < evidence.length) {
                                                    setEvidence((current) =>
                                                        current.filter(
                                                            (_, itemIndex) =>
                                                                itemIndex !==
                                                                index,
                                                        ),
                                                    );
                                                } else {
                                                    removeLocalMedia(index);
                                                }
                                            }}
                                            className="absolute -right-2 -top-2 size-7 rounded-full border-zinc-200 bg-white p-0 text-zinc-500 shadow-sm hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2
                                                className="size-3.5"
                                                aria-hidden="true"
                                            />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </form>

                <DialogFooter className="mb-0 border-t border-zinc-100 bg-zinc-50/70 px-8 pt-4 pb-6 sm:px-10">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={() => handleDialogOpenChange(false)}
                        className="h-10 rounded-xl border-zinc-200 bg-white px-4"
                    >
                        Đóng
                    </Button>
                    <Button
                        type="submit"
                        form="edit-order-return-form"
                        disabled={
                            isSubmitting ||
                            (evidenceRequired &&
                                evidence.length +
                                    images.length +
                                    videos.length ===
                                    0)
                        }
                        className="h-10 rounded-xl bg-zinc-950 px-5 font-semibold text-white hover:bg-zinc-800"
                    >
                        {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </DialogFooter>
            </DialogContent>
            {activeMedia ? (
                <ImageLightbox
                    media={activeMedia.items}
                    initialIndex={activeMedia.index}
                    title="Xem bằng chứng hoàn hàng"
                    altPrefix="Bằng chứng"
                    onClose={() => setActiveMedia(null)}
                />
            ) : null}
        </Dialog>
    );
}
