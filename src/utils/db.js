const DB_NAME = 'VNADA_DB';
const DB_VERSION = 1;

const STORE_PROFILES = 'user_profiles';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_PROFILES)) {
        const profileStore = db.createObjectStore(STORE_PROFILES, { keyPath: 'user_id' });
        profileStore.createIndex('user_id', 'user_id', { unique: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProfile(profile) {
  const db = await openDB();
  const tx = db.transaction(STORE_PROFILES, 'readwrite');
  tx.objectStore(STORE_PROFILES).put(profile);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getProfile(userId) {
  const db = await openDB();
  const tx = db.transaction(STORE_PROFILES, 'readonly');
  const store = tx.objectStore(STORE_PROFILES);
  const request = store.get(userId);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export { STORE_PROFILES };
