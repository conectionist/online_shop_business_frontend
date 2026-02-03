/**
 * Validates that a File can be decoded as an image. Resolves if the browser
 * can decode it; rejects if the file is corrupt, wrong format, or not an image.
 * Uses createImageBitmap when available, with Image+objectURL fallback.
 */
export function validateImageFile(file: File): Promise<void> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file).then(() => {});
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image decode failed'));
    };
    img.src = url;
  });
}
