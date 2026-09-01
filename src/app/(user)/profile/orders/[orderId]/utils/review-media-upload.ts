// File nay dong goi luong upload anh/video review len Media Service.
// Anh dung output WebP da xu ly; video dung URL object goc tu CDN.
import { mediaService, type MediaUploadMimeType, type ReviewMediaCleanupAsset } from '@/services/media';

type ReviewMediaUploadResult = {
  imageUrls: string[];
  videoUrls: string[];
  uploadedAssets: ReviewMediaCleanupAsset[];
};

// Dung URL WebP lon theo object key ma Media Service tra ve cho anh review.
function buildProcessedReviewImageUrl(publicBaseUrl: string | null, objectKey: string): string {
  if (!publicBaseUrl) throw new Error('Media CDN chua duoc cau hinh.');
  const [, , purpose, ownerId, assetId] = objectKey.split('/');
  if (purpose !== 'review_image' || !ownerId || !assetId) throw new Error('Duong dan anh review khong hop le.');
  return `${publicBaseUrl.replace(/\/$/, '')}/media/processed/${purpose}/${ownerId}/${assetId}/large.webp`;
}

// Video review chua can pipeline thumbnail; su dung object goc de trinh duyet phat truc tiep.
function buildOriginalReviewVideoUrl(publicBaseUrl: string | null, objectKey: string): string {
  if (!publicBaseUrl) throw new Error('Media CDN chua duoc cau hinh.');
  const [, , purpose, ownerId, assetId] = objectKey.split('/');
  if (purpose !== 'review_video' || !ownerId || !assetId) throw new Error('Duong dan video review khong hop le.');
  return `${publicBaseUrl.replace(/\/$/, '')}/${objectKey}`;
}

// Upload song song anh va video; nếu một file thất bại thì dọn tất cả asset đã upload thành công trong batch đó.
export async function uploadReviewMedia(images: File[], videos: File[]): Promise<ReviewMediaUploadResult> {
  const uploadedAssets: ReviewMediaCleanupAsset[] = [];
  const uploadTasks = [
    ...images.map((file) => ({ file, purpose: 'review_image' as const })),
    ...videos.map((file) => ({ file, purpose: 'review_video' as const })),
  ];

  const results = await Promise.allSettled(uploadTasks.map(async ({ file, purpose }) => {
    const presigned = await mediaService.createPresignedUpload({ fileName: file.name, contentType: file.type as MediaUploadMimeType, fileSize: file.size, purpose });
    await mediaService.uploadToPresignedPost(presigned.upload, file);
    const uploadedAsset = { assetId: presigned.assetId, purpose } satisfies ReviewMediaCleanupAsset;
    uploadedAssets.push(uploadedAsset);
    return {
      purpose,
      url: purpose === 'review_image'
        ? buildProcessedReviewImageUrl(presigned.publicBaseUrl, presigned.objectKey)
        : buildOriginalReviewVideoUrl(presigned.publicBaseUrl, presigned.objectKey),
    };
  }));

  const failedUpload = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');
  if (failedUpload) {
    await mediaService.cleanupUploadedReviewAssets(uploadedAssets).catch(() => undefined);
    throw failedUpload.reason instanceof Error ? failedUpload.reason : new Error('Không thể upload media đánh giá.');
  }

  const successfulResults = results.map((result) => (result as PromiseFulfilledResult<{ purpose: 'review_image' | 'review_video'; url: string }>).value);
  return {
    imageUrls: successfulResults.filter((result) => result.purpose === 'review_image').map((result) => result.url),
    videoUrls: successfulResults.filter((result) => result.purpose === 'review_video').map((result) => result.url),
    uploadedAssets,
  };
}
