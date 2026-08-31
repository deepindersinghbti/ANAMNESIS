/**
 * Web Crypto SHA-256 and MD5 hash calculator and client-side EXIF extractor
 */

export async function calculateSha256(fileOrBlob: Blob): Promise<string> {
  const arrayBuffer = await fileOrBlob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function extractExifFromDataView(dataView: DataView): Record<string, any> {
  const exif: Record<string, any> = {};

  try {
    if (dataView.byteLength < 4) return exif;

    // Check JPEG SOI marker (0xFFD8)
    if (dataView.getUint16(0, false) !== 0xffd8) {
      exif['Format'] = 'Non-JPEG or Raw File';
      return exif;
    }

    let offset = 2;
    const length = dataView.byteLength;

    while (offset < length) {
      if (dataView.getUint8(offset) !== 0xff) break;
      const marker = dataView.getUint8(offset + 1);

      // APP1 Marker (0xFFE1) containing Exif
      if (marker === 0xe1) {
        const app1Length = dataView.getUint16(offset + 2, false);
        const exifHeader = dataView.getUint32(offset + 4, false);

        // Check for 'Exif\0\0' (0x45786966)
        if (exifHeader === 0x45786966) {
          const tiffStart = offset + 10;
          const endianness = dataView.getUint16(tiffStart, false);
          const isLittle = endianness === 0x4949; // 'II'

          const ifdOffset = dataView.getUint32(tiffStart + 4, isLittle);
          if (ifdOffset < app1Length) {
            parseIFD(dataView, tiffStart + ifdOffset, tiffStart, isLittle, exif);
          }
        }
        offset += 2 + app1Length;
      } else if (marker === 0xe0) {
        // APP0 JFIF
        const app0Length = dataView.getUint16(offset + 2, false);
        exif['JFIF_Standard'] = 'APP0 Standard Marker Present';
        offset += 2 + app0Length;
      } else if (marker === 0xd9) {
        // EOI
        break;
      } else {
        const markerLength = dataView.getUint16(offset + 2, false);
        offset += 2 + markerLength;
      }
    }
  } catch (err) {
    console.warn('EXIF parsing failed gracefully:', err);
  }

  return exif;
}

function parseIFD(
  dataView: DataView,
  dirStart: number,
  tiffStart: number,
  isLittle: boolean,
  tags: Record<string, any>
) {
  if (dirStart + 2 > dataView.byteLength) return;
  const entries = dataView.getUint16(dirStart, isLittle);

  const TAG_NAMES: Record<number, string> = {
    0x010e: 'ImageDescription',
    0x010f: 'Make',
    0x0110: 'Model',
    0x0112: 'Orientation',
    0x011a: 'XResolution',
    0x011b: 'YResolution',
    0x0131: 'Software',
    0x0132: 'DateTime',
    0x8769: 'ExifIFDPointer',
    0x8825: 'GPSInfoIFDPointer',
    0x9003: 'DateTimeOriginal',
    0x9004: 'DateTimeDigitized',
    0x920a: 'FocalLength',
    0x829a: 'ExposureTime',
    0x829d: 'FNumber',
    0x8827: 'ISOSpeedRatings',
  };

  for (let i = 0; i < entries; i++) {
    const entryOffset = dirStart + 2 + i * 12;
    if (entryOffset + 12 > dataView.byteLength) break;

    const tag = dataView.getUint16(entryOffset, isLittle);
    const type = dataView.getUint16(entryOffset + 2, isLittle);
    const count = dataView.getUint32(entryOffset + 4, isLittle);
    const valueOffset = entryOffset + 8;

    const tagName = TAG_NAMES[tag] || `Tag_0x${tag.toString(16)}`;

    // Handle string types (type 2)
    if (type === 2) {
      let strOffset = tiffStart + dataView.getUint32(valueOffset, isLittle);
      if (count <= 4) strOffset = valueOffset;
      if (strOffset + count <= dataView.byteLength) {
        let str = '';
        for (let s = 0; s < count - 1; s++) {
          str += String.fromCharCode(dataView.getUint8(strOffset + s));
        }
        tags[tagName] = str.trim();
      }
    } else if (type === 3) {
      // SHORT
      tags[tagName] = dataView.getUint16(valueOffset, isLittle);
    } else if (type === 4) {
      // LONG
      tags[tagName] = dataView.getUint32(valueOffset, isLittle);
    }
  }
}
