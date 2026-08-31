/**
 * Advanced Client-Side Canvas Image Forensics Engine
 * Implements ELA (Error Level Analysis), Noise Variance, Sobel Seam Detection, Luminance Gradients
 */

export interface ELAOptions {
  quality?: number; // 0.70 - 0.90
  scaleMultiplier?: number; // 15 - 30
}

/**
 * Computes Error Level Analysis (ELA)
 * Resaves the image at a known quality (e.g. 75%), then subtracts the recompressed image
 * from the original to reveal compression variance (spliced areas show distinct error rates).
 */
export async function computeELA(
  sourceCanvas: HTMLCanvasElement,
  options: ELAOptions = {}
): Promise<ImageData> {
  const { quality = 0.75, scaleMultiplier = 20 } = options;
  const { width, height } = sourceCanvas;

  const srcCtx = sourceCanvas.getContext('2d');
  if (!srcCtx) throw new Error('Cannot get 2D context');

  const origImageData = srcCtx.getImageData(0, 0, width, height);
  const origData = origImageData.data;

  // Convert to JPEG at target quality
  const jpegDataUrl = sourceCanvas.toDataURL('image/jpeg', quality);

  // Load back JPEG
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = jpegDataUrl;
  });

  // Create temporary canvas to read recompressed pixels
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) throw new Error('Cannot get temp 2D context');

  tempCtx.drawImage(img, 0, 0);
  const recompressedData = tempCtx.getImageData(0, 0, width, height).data;

  // Output image data
  const output = tempCtx.createImageData(width, height);
  const outData = output.data;

  for (let i = 0; i < origData.length; i += 4) {
    const diffR = Math.abs(origData[i] - recompressedData[i]) * scaleMultiplier;
    const diffG = Math.abs(origData[i + 1] - recompressedData[i + 1]) * scaleMultiplier;
    const diffB = Math.abs(origData[i + 2] - recompressedData[i + 2]) * scaleMultiplier;

    outData[i] = Math.min(255, diffR);
    outData[i + 1] = Math.min(255, diffG);
    outData[i + 2] = Math.min(255, diffB);
    outData[i + 3] = 255; // Solid Alpha
  }

  return output;
}

/**
 * Noise Sensor Variance Analysis (High-Pass Laplacian Filter)
 * Isolates high-frequency noise patterns to spot airbrushing, generative smoothing, or sensor noise mismatches.
 */
export function computeNoiseAnalysis(sourceCanvas: HTMLCanvasElement): ImageData {
  const { width, height } = sourceCanvas;
  const srcCtx = sourceCanvas.getContext('2d');
  if (!srcCtx) throw new Error('Cannot get 2D context');

  const srcData = srcCtx.getImageData(0, 0, width, height).data;
  const output = srcCtx.createImageData(width, height);
  const out = output.data;

  // 3x3 Laplacian High-Pass Kernel:
  // [  0, -1,  0 ]
  // [ -1,  4, -1 ]
  // [  0, -1,  0 ]

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      for (let c = 0; c < 3; c++) {
        const center = srcData[idx + c];
        const top = srcData[((y - 1) * width + x) * 4 + c];
        const bottom = srcData[((y + 1) * width + x) * 4 + c];
        const left = srcData[(y * width + (x - 1)) * 4 + c];
        const right = srcData[(y * width + (x + 1)) * 4 + c];

        const lap = Math.abs(4 * center - top - bottom - left - right) * 6;
        out[idx + c] = Math.min(255, lap);
      }
      out[idx + 3] = 255;
    }
  }

  return output;
}

/**
 * Sobel Edge & Seam Detection
 * Highlights compositing boundaries, clone-stamp edges, and feathering artifacts.
 */
export function computeSobelEdges(sourceCanvas: HTMLCanvasElement): ImageData {
  const { width, height } = sourceCanvas;
  const srcCtx = sourceCanvas.getContext('2d');
  if (!srcCtx) throw new Error('Cannot get 2D context');

  const srcData = srcCtx.getImageData(0, 0, width, height).data;
  const output = srcCtx.createImageData(width, height);
  const out = output.data;

  // Convert to grayscale first
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = srcData[i * 4];
    const g = srcData[i * 4 + 1];
    const b = srcData[i * 4 + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p00 = gray[(y - 1) * width + (x - 1)];
      const p01 = gray[(y - 1) * width + x];
      const p02 = gray[(y - 1) * width + (x + 1)];
      const p10 = gray[y * width + (x - 1)];
      const p12 = gray[y * width + (x + 1)];
      const p20 = gray[(y + 1) * width + (x - 1)];
      const p21 = gray[(y + 1) * width + x];
      const p22 = gray[(y + 1) * width + (x + 1)];

      const gx = -p00 + p02 - 2 * p10 + 2 * p12 - p20 + p22;
      const gy = -p00 - 2 * p01 - p02 + p20 + 2 * p21 + p22;

      const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy) * 1.5);
      const idx = (y * width + x) * 4;

      // Render in high-contrast forensic cyan/amber
      out[idx] = mag > 120 ? 255 : mag * 0.5; // R
      out[idx + 1] = mag; // G
      out[idx + 2] = mag > 80 ? 255 : 40; // B
      out[idx + 3] = 255;
    }
  }

  return output;
}

/**
 * Luminance & Contrast Enhancement
 * Isolate shadows, specular highlights, and directional light vectors
 */
export function computeLuminance(sourceCanvas: HTMLCanvasElement): ImageData {
  const { width, height } = sourceCanvas;
  const srcCtx = sourceCanvas.getContext('2d');
  if (!srcCtx) throw new Error('Cannot get 2D context');

  const srcData = srcCtx.getImageData(0, 0, width, height).data;
  const output = srcCtx.createImageData(width, height);
  const out = output.data;

  for (let i = 0; i < srcData.length; i += 4) {
    const lum = 0.299 * srcData[i] + 0.587 * srcData[i + 1] + 0.114 * srcData[i + 2];
    // Apply steep sigmoid contrast curve to amplify shadow/light boundaries
    const contrasted = 255 / (1 + Math.exp(-0.04 * (lum - 128)));

    out[i] = contrasted;
    out[i + 1] = contrasted;
    out[i + 2] = contrasted;
    out[i + 3] = 255;
  }

  return output;
}

/**
 * Inverted / Negative Mode (reveals low-intensity anomalies and dark-region splices)
 */
export function computeInverted(sourceCanvas: HTMLCanvasElement): ImageData {
  const { width, height } = sourceCanvas;
  const srcCtx = sourceCanvas.getContext('2d');
  if (!srcCtx) throw new Error('Cannot get 2D context');

  const srcData = srcCtx.getImageData(0, 0, width, height).data;
  const output = srcCtx.createImageData(width, height);
  const out = output.data;

  for (let i = 0; i < srcData.length; i += 4) {
    out[i] = 255 - srcData[i];
    out[i + 1] = 255 - srcData[i + 1];
    out[i + 2] = 255 - srcData[i + 2];
    out[i + 3] = 255;
  }

  return output;
}

/**
 * Solarization (Sabattier Effect) - reverses half-tones to expose tone jumps
 */
export function computeSolarize(sourceCanvas: HTMLCanvasElement): ImageData {
  const { width, height } = sourceCanvas;
  const srcCtx = sourceCanvas.getContext('2d');
  if (!srcCtx) throw new Error('Cannot get 2D context');

  const srcData = srcCtx.getImageData(0, 0, width, height).data;
  const output = srcCtx.createImageData(width, height);
  const out = output.data;

  for (let i = 0; i < srcData.length; i += 4) {
    out[i] = srcData[i] > 128 ? 255 - srcData[i] : srcData[i];
    out[i + 1] = srcData[i + 1] > 128 ? 255 - srcData[i + 1] : srcData[i + 1];
    out[i + 2] = srcData[i + 2] > 128 ? 255 - srcData[i + 2] : srcData[i + 2];
    out[i + 3] = 255;
  }

  return output;
}

/**
 * Blue Channel Isolation (Blue channel typically contains sensor noise and chromatic aberration cues)
 */
export function computeBlueChannel(sourceCanvas: HTMLCanvasElement): ImageData {
  const { width, height } = sourceCanvas;
  const srcCtx = sourceCanvas.getContext('2d');
  if (!srcCtx) throw new Error('Cannot get 2D context');

  const srcData = srcCtx.getImageData(0, 0, width, height).data;
  const output = srcCtx.createImageData(width, height);
  const out = output.data;

  for (let i = 0; i < srcData.length; i += 4) {
    const b = srcData[i + 2];
    out[i] = b * 0.1;
    out[i + 1] = b * 0.4;
    out[i + 2] = b;
    out[i + 3] = 255;
  }

  return output;
}
