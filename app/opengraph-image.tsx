import {
  createSocialPreviewImageResponse,
  socialPreviewAlt,
  socialPreviewContentType,
  socialPreviewSize,
} from "@/components/metadata/social-preview-image";

export const alt = socialPreviewAlt;
export const size = socialPreviewSize;
export const contentType = socialPreviewContentType;

export default function Image() {
  return createSocialPreviewImageResponse();
}
