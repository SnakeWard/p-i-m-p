/**
 * Audio bytes live here and nowhere else.
 *
 * They must never enter zustand state, because `store.ts` persists `tracks`
 * to localStorage (~5MB/origin) — a single 2-minute MP3 would quota-fail the
 * write and take every unrelated save down with it. `Track.render` carries
 * metadata only; the bytes are keyed by track id in IndexedDB.
 */

const DB_NAME = "pimp-audio-v1";
const STORE = "renders";
const VERSION = 1;

export interface RenderBlobRecord {
  trackId: string;
  queueId: string;
  model: string;
  mime: string;
  bytes: ArrayBuffer;
  createdAt: string;
}

export function idbAvailable(): boolean {
  try {
    return typeof indexedDB !== "undefined" && indexedDB !== null;
  } catch {
    return false;
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!idbAvailable()) {
      reject(new Error("IndexedDB is unavailable in this browser context."));
      return;
    }
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "trackId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed."));
    req.onblocked = () => reject(new Error("IndexedDB open blocked by another tab."));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error("IndexedDB request failed."));
      tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted."));
    });
  } finally {
    db.close();
  }
}

export async function putRender(record: RenderBlobRecord): Promise<void> {
  await withStore("readwrite", (store) => store.put(record));
}

export async function getRender(trackId: string): Promise<RenderBlobRecord | null> {
  const row = await withStore<RenderBlobRecord | undefined>("readonly", (store) =>
    store.get(trackId),
  );
  return row ?? null;
}

export async function deleteRender(trackId: string): Promise<void> {
  try {
    await withStore("readwrite", (store) => store.delete(trackId));
  } catch {
    // A cache we cannot clear is not worth failing a user action over.
  }
}
