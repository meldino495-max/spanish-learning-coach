const DB_NAME = 'coach-custom-bg-v1';
const STORE = 'background';
const RECORD_ID = 'main';

export interface CustomBgMeta {
  enabled: boolean;
  float: boolean;
  opacity: number;
  mimeType: string;
  fileName: string;
}

interface StoredRecord extends CustomBgMeta {
  id: string;
  blob: Blob;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
  });
}

export async function loadCustomBackground(): Promise<{ meta: CustomBgMeta; blob: Blob } | null> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(RECORD_ID);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const row = req.result as StoredRecord | undefined;
        if (!row?.blob) {
          resolve(null);
          return;
        }
        resolve({
          meta: {
            enabled: row.enabled,
            float: row.float,
            opacity: row.opacity,
            mimeType: row.mimeType,
            fileName: row.fileName,
          },
          blob: row.blob,
        });
      };
    });
  } catch {
    return null;
  }
}

export async function saveCustomBackground(
  blob: Blob,
  meta: CustomBgMeta,
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const record: StoredRecord = { id: RECORD_ID, ...meta, blob };
    const req = tx.objectStore(STORE).put(record);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve();
  });
}

export async function updateCustomBackgroundMeta(
  partial: Partial<CustomBgMeta>,
): Promise<void> {
  const existing = await loadCustomBackground();
  if (!existing) return;
  await saveCustomBackground(existing.blob, { ...existing.meta, ...partial });
}

export async function clearCustomBackground(): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const req = tx.objectStore(STORE).delete(RECORD_ID);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve();
    });
  } catch {
    /* ignore */
  }
}

export const CUSTOM_BG_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/bmp,image/svg+xml,.gif';
export const CUSTOM_BG_MAX_BYTES = 20 * 1024 * 1024;

export function isAllowedBackgroundFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  return /\.gif$/i.test(file.name);
}
