import {Platform} from 'react-native';
import {
  keepLocalCopy,
  type DocumentPickerResponse,
} from '@react-native-documents/picker';
import {androidContentUriFromFile} from '../native/androidFileUri';

export function normalizeUploadUri(uri: string): string {
  const decoded = decodeURIComponent(uri.trim());
  if (decoded.startsWith('file://') || decoded.startsWith('content://')) {
    return decoded;
  }
  if (decoded.startsWith('/')) {
    return `file://${decoded}`;
  }
  return decoded;
}

/** Normalize URI before appending to FormData (must be readable by RN networking on Android). */
export function uriForFormDataUpload(uri: string): string {
  return normalizeUploadUri(uri);
}

function needsLocalExport(file: DocumentPickerResponse): boolean {
  return file.isVirtual === true && !!file.convertibleToMimeTypes?.[0]?.mimeType;
}

/**
 * Resolve a picked document for multipart upload.
 * Android: copy into app cache and expose via FileProvider. RN cannot open many picker
 * content:// URIs (e.g. Downloads); native returns "Could not retrieve file" → xhr status 0.
 */
export async function resolvePickedFileForUpload(
  file: DocumentPickerResponse,
): Promise<{uri: string; name: string; type: string}> {
  const name = file.name?.trim() || `document-${Date.now()}.pdf`;
  const type =
    file.type ??
    file.convertibleToMimeTypes?.[0]?.mimeType ??
    'application/pdf';

  const mustCopyLocally =
    Platform.OS === 'android' || needsLocalExport(file);

  if (!mustCopyLocally && file.uri) {
    return {uri: normalizeUploadUri(file.uri), name, type};
  }

  const convertVirtualFileToType = file.convertibleToMimeTypes?.[0]?.mimeType;
  const [copy] = await keepLocalCopy({
    destination: 'cachesDirectory',
    files: [
      {
        uri: file.uri,
        fileName: name,
        ...(convertVirtualFileToType ? {convertVirtualFileToType} : {}),
      },
    ],
  });

  if (copy.status === 'success' && copy.localUri) {
    let uri = normalizeUploadUri(copy.localUri);
    if (Platform.OS === 'android') {
      uri = await androidContentUriFromFile(uri);
    }
    if (__DEV__) {
      console.log(
        `[pickedFile] ${Platform.OS} copy ok source=${file.uri.slice(0, 40)} → ${uri.slice(0, 60)}`,
      );
    }
    return {uri, name, type};
  }

  if (!mustCopyLocally && file.uri) {
    return {uri: normalizeUploadUri(file.uri), name, type};
  }

  const detail =
    copy.status === 'error' ? copy.copyError : 'Could not access the selected file';
  throw new Error(detail);
}
