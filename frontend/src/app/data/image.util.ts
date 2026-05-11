/**
 * Resize an uploaded image to a max dimension and return a base64 data URL.
 * Default 128×128 PNG keeps file under ~30KB for typical logos.
 */
export async function resizeToDataUrl(
  file: File,
  maxSize = 128,
  format: 'image/png' | 'image/jpeg' = 'image/png',
  quality = 0.9,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(maxSize / bitmap.width, maxSize / bitmap.height, 1);
  const w = Math.round(bitmap.width * ratio);
  const h = Math.round(bitmap.height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL(format, quality);
}
