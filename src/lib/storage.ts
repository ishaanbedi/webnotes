import "server-only";
import { DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function storageEnabled() {
  return !!(process.env.AWS_ENDPOINT_URL_S3 && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

const bucket = () => process.env.S3_BUCKET ?? "uploads";

let _client: S3Client | undefined;
function s3() {
  return (_client ??= new S3Client({
    region: process.env.AWS_REGION,
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! },
    forcePathStyle: true, // Neon Object Storage is path-style only
    requestChecksumCalculation: "WHEN_REQUIRED", // keeps presigned PUTs valid (see Neon docs)
  }));
}

export const noteKey = (noteId: string, name: string) => `notes/${noteId}/${name}`;

export function presignUpload(key: string, contentType: string, size: number) {
  return getSignedUrl(
    s3(),
    new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: contentType, ContentLength: size }),
    { expiresIn: 300 },
  );
}

export function presignDownload(key: string) {
  return getSignedUrl(s3(), new GetObjectCommand({ Bucket: bucket(), Key: key }), { expiresIn: 60 });
}

/** Best-effort removal of everything stored for a note. */
export async function deleteNoteFiles(noteId: string) {
  if (!storageEnabled()) return;
  try {
    const list = await s3().send(new ListObjectsV2Command({ Bucket: bucket(), Prefix: `notes/${noteId}/`, MaxKeys: 1000 }));
    const keys = (list.Contents ?? []).map((o) => ({ Key: o.Key! }));
    if (keys.length) await s3().send(new DeleteObjectsCommand({ Bucket: bucket(), Delete: { Objects: keys } }));
  } catch (e) {
    console.error("deleteNoteFiles failed", e);
  }
}
