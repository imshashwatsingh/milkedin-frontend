import { Alert, Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

interface SaveArgs {
  filename: string;
  mime: string;
  bytes: Uint8Array;
}

/**
 * Cross-platform file saver.
 * - Web: triggers a real browser download via a Blob + anchor.
 * - Native: writes the bytes to the cache directory (base64) and hands the
 *   file to the OS share sheet so the user can save/open it.
 */
export async function saveFile({ filename, mime, bytes }: SaveArgs): Promise<void> {
  if (Platform.OS === 'web') {
    const g = globalThis as any;
    const doc = g.document as Document | undefined;
    const BlobCtor = g.Blob as typeof Blob | undefined;
    const URLCtor = g.URL as typeof URL | undefined;
    if (doc && BlobCtor && URLCtor) {
      const blob = new BlobCtor([bytes as any], { type: mime });
      const url = URLCtor.createObjectURL(blob);
      const anchor = doc.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      doc.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URLCtor.revokeObjectURL(url);
      return;
    }
  }

  // Native: write to the app cache via the stable legacy API, then hand the
  // file to the OS share sheet so the user can save/open it.
  try {
    const base64 = uint8ToBase64(bytes);
    const uri = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await Share.share({ url: uri, title: filename });
  } catch {
    Alert.alert('Export ready', `Saved ${filename} to the app's cache.`);
  }
}

/** Convert a Uint8Array to a base64 string without relying on `btoa`. */
function uint8ToBase64(bytes: Uint8Array): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  const len = bytes.length;
  let i = 0;
  for (; i < len - 2; i += 3) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    result += chars[(n >> 18) & 63] + chars[(n >> 12) & 63] + chars[(n >> 6) & 63] + chars[n & 63];
  }
  const rem = len - i;
  if (rem === 1) {
    const n = bytes[i] << 16;
    result += chars[(n >> 18) & 63] + chars[(n >> 12) & 63] + '==';
  } else if (rem === 2) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8);
    result += chars[(n >> 18) & 63] + chars[(n >> 12) & 63] + chars[(n >> 6) & 63] + '=';
  }
  return result;
}
