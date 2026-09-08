/* =========================================================================
 * PREPARING A COPY FOR THE MODEL
 *
 * A photograph straight off a phone is 3-4 MB at 4032x3024. Sent whole it
 * takes over thirty seconds to analyse and exceeds the request deadline —
 * measured at 32.1s against a 1.73 MB payload, where the same scene at
 * 1568px completed in 16.2s. The resolution buys nothing either: vision
 * models downsample to roughly this size on the way in.
 *
 * WHAT THIS DOES NOT AFFECT
 *
 * Only the copy handed to the model is resized. The SHA-256 is computed
 * over the original bytes, the EXIF is parsed from the original bytes, and
 * the forensic canvas runs Error Level Analysis and noise on the original
 * bytes. Those are the measurements the product stakes its claims on and
 * none of them sees this function's output.
 * ========================================================================= */

/** Longest edge of the copy sent for interpretation. */
export const MODEL_IMAGE_MAX_EDGE = 1568;

export interface PreparedImage {
  /** Data URL to send. The original when no resize was needed or possible. */
  dataUrl: string;
  /** The mime type of what is actually being sent, which may differ from the
   *  original: a resized copy is re-encoded as JPEG. */
  mimeType: string;
  resized: boolean;
}

function mimeFromDataUrl(dataUrl: string): string {
  return /^data:([^;,]+)[;,]/.exec(dataUrl)?.[1] ?? 'application/octet-stream';
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The image could not be decoded for resizing.'));
    image.src = dataUrl;
  });
}

/**
 * Return a copy of the image bounded to `maxEdge` on its longest side.
 *
 * Never throws. If the image cannot be decoded — an unusual format, a
 * browser that will not render it — the original is returned unchanged and
 * the request proceeds as it did before. A slow analysis is a better
 * outcome than a failed one.
 */
export async function prepareImageForModel(
  dataUrl: string,
  originalMimeType: string,
  maxEdge: number = MODEL_IMAGE_MAX_EDGE
): Promise<PreparedImage> {
  const fallback: PreparedImage = {
    dataUrl,
    mimeType: originalMimeType || mimeFromDataUrl(dataUrl),
    resized: false,
  };

  if (!dataUrl.startsWith('data:image/')) return fallback;

  try {
    const image = await loadImage(dataUrl);
    const longest = Math.max(image.naturalWidth, image.naturalHeight);
    if (!longest || longest <= maxEdge) return fallback;

    const scale = maxEdge / longest;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) return fallback;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Re-encoded, so the mime type changes and must be reported honestly:
    // the server is told what it is actually receiving.
    const resized = canvas.toDataURL('image/jpeg', 0.9);
    if (!resized.startsWith('data:image/jpeg')) return fallback;

    return { dataUrl: resized, mimeType: 'image/jpeg', resized: true };
  } catch {
    return fallback;
  }
}
