import { createHash } from 'node:crypto';

export type UploadKind = 'image' | 'resume';

// Images go through Cloudinary's image pipeline (resizing, formats); the resume is a raw file
const UPLOAD_TARGETS: Record<UploadKind, { folder: string; resourceType: 'image' | 'raw' }> = {
  image: { folder: 'portfolio/images', resourceType: 'image' },
  resume: { folder: 'portfolio/resume', resourceType: 'raw' },
};

// https://cloudinary.com/documentation/authentication_signatures
export function signParams(params: Record<string, string | number>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return createHash('sha1').update(toSign + apiSecret).digest('hex');
}

export interface UploadSignature {
  uploadUrl: string;
  fields: { api_key: string; timestamp: number; folder: string; signature: string };
}

// The browser posts the file plus these fields straight to Cloudinary, so uploads skip Vercel's body limit
export function createUploadSignature(
  kind: UploadKind,
  creds: { cloudName: string; apiKey: string; apiSecret: string },
  now = Date.now(),
): UploadSignature {
  const { folder, resourceType } = UPLOAD_TARGETS[kind];
  const timestamp = Math.floor(now / 1000);
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${creds.cloudName}/${resourceType}/upload`,
    fields: { api_key: creds.apiKey, timestamp, folder, signature: signParams({ folder, timestamp }, creds.apiSecret) },
  };
}
