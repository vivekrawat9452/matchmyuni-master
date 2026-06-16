import {NativeModules, Platform} from 'react-native';

type FileUriModule = {
  getContentUriForFile: (fileUri: string) => Promise<string>;
};

const module = NativeModules.MMFileUri as FileUriModule | undefined;

function normalizeFileUri(uri: string): string {
  const decoded = decodeURIComponent(uri.trim());
  if (decoded.startsWith('file://') || decoded.startsWith('content://')) {
    return decoded;
  }
  if (decoded.startsWith('/')) {
    return `file://${decoded}`;
  }
  return decoded;
}

/** Convert a cache file:// path to content:// for RN Android multipart uploads. */
export async function androidContentUriFromFile(fileUri: string): Promise<string> {
  const normalized = normalizeFileUri(fileUri);
  if (Platform.OS !== 'android' || normalized.startsWith('content://')) {
    return normalized;
  }
  if (!module?.getContentUriForFile) {
    return normalized;
  }
  return module.getContentUriForFile(normalized);
}
