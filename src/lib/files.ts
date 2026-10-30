// Shared (client + server) helpers for note images.
export const IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const FILE_NAME_RE = /^[0-9a-f-]{36}\.(png|jpg|webp|gif)$/;

/** Append the share token to embedded image URLs so anonymous viewers of a public link can load them. */
export function withShareToken(markdown: string, token: string) {
  return markdown.replace(
    /(\/api\/files\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:png|jpg|webp|gif))(?!\?)/g,
    `$1?t=${encodeURIComponent(token)}`,
  );
}
