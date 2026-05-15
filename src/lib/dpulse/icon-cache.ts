/**
 * IndexedDB cache for service icons fetched from IPFS.
 * Persists icons across page reloads and sessions.
 */

const DB_NAME = 'dpulse-icons';
const DB_VERSION = 1;
const STORE_NAME = 'icons';

let db: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase> | null = null;

/**
 * Initialize the IndexedDB database.
 * Returns a promise that resolves to the database instance.
 */
function initDB(): Promise<IDBDatabase> {
  if (db) return Promise.resolve(db);
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      dbInitPromise = null;
      reject(new Error('Failed to open icon cache database'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
  });

  return dbInitPromise;
}

/**
 * Get an icon blob from the cache.
 * @param cid - The IPFS CID of the icon
 * @returns The cached Blob or null if not found
 */
export async function getIcon(cid: string): Promise<Blob | null> {
  try {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(cid);

      transaction.onerror = () => {
        reject(new Error(`Transaction failed for CID: ${cid}`));
      };

      request.onerror = () => {
        reject(new Error(`Failed to get icon for CID: ${cid}`));
      };

      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  } catch {
    return null;
  }
}

/**
 * Store an icon blob in the cache.
 * @param cid - The IPFS CID of the icon
 * @param blob - The icon Blob to cache
 */
export async function setIcon(cid: string, blob: Blob): Promise<void> {
  try {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(blob, cid);

      transaction.onerror = () => {
        reject(new Error(`Transaction failed for CID: ${cid}`));
      };

      request.onerror = () => {
        reject(new Error(`Failed to cache icon for CID: ${cid}`));
      };

      transaction.oncomplete = () => {
        resolve();
      };
    });
  } catch {
    // Silently fail - caching is not critical
  }
}
