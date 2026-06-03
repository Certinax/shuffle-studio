import {
  createSocialPreviewImageResponse,
  socialPreviewContentType,
} from "@/components/metadata/social-preview-image";

export function GET() {
  const response = createSocialPreviewImageResponse();

  response.headers.set("Content-Type", socialPreviewContentType);
  response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");

  return response;
}
