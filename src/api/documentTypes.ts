/** Allowed values for POST /user/documents `documentTypes` entries */
export const API_DOCUMENT_TYPES = [
  'passport',
  'national_id',
  'o_level',
  'a_level',
  'diploma',
  'bachelor_degree_certificate',
  'bachelor_degree_transcripts',
  'other',
] as const;

export type ApiDocumentType = (typeof API_DOCUMENT_TYPES)[number];

/** Maps UI document row keys (profile / start application) to API documentType */
const UI_KEY_TO_API: Record<string, ApiDocumentType> = {
  academic_transcripts: 'bachelor_degree_transcripts',
  passport_copy: 'passport',
  personal_statement: 'other',
  recommendation_letter: 'other',
  english_proficiency: 'other',
};

export function uiKeyToApiDocumentType(uiKey: string): ApiDocumentType | undefined {
  const mapping = UI_KEY_TO_API[uiKey];
  if (!mapping) {
    console.warn(`[DocMapping] No mapping found for key: ${uiKey}`);
    return undefined; // Return undefined so we can catch it in the UI
  }
  return mapping;
}
/** Prefix upload filename so multiple `other` slots can be matched on GET. */
export function uploadFilenameForUiKey(uiKey: string, originalName?: string | null): string {
  const base = originalName?.trim() || `${uiKey}.pdf`;
  const prefix = `${uiKey}_`;
  return base.toLowerCase().startsWith(prefix) ? base : `${prefix}${base}`;
}

function filenameMatchesUiKey(filename: string | undefined | null, uiKey: string): boolean {
  if (!filename) {
    return false;
  }
  const norm = filename.toLowerCase();
  return (
    norm.includes(uiKey) ||
    norm.includes(uiKey.replace(/_/g, '-')) ||
    norm.includes(uiKey.replace(/_/g, ' '))
  );
}

export function documentMatchesUiKey(
  documentType: string | undefined | null,
  uiKey: string,
  filename?: string | null,
): boolean {
  if (!documentType) {
    return false;
  }
  const norm = documentType.toLowerCase();
  const expected = uiKeyToApiDocumentType(uiKey);
  if (norm === uiKey.toLowerCase()) {
    return true;
  }
  if (norm !== expected) {
    return false;
  }
  if (expected === 'other') {
    return filenameMatchesUiKey(filename, uiKey);
  }
  return true;
}
