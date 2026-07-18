import { lar_threshold, f_min, f_max } from './constants.js';

const DB_NAME = 'VNADA_DB';
const DB_VERSION = 1;

const STORE_PROFILES = 'user_profiles';

function openDB() {
  return new Promise(function (resolve, reject) {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_PROFILES)) {
        const profileStore = db.createObjectStore(STORE_PROFILES, { keyPath: 'user_id' });
        profileStore.createIndex('user_id', 'user_id', { unique: true });
      }
    };

    request.onsuccess = function () { resolve(request.result); };
    request.onerror = function () { reject(request.error); };
  });
}

export async function saveProfile(profile) {
  const db = await openDB();
  const tx = db.transaction(STORE_PROFILES, 'readwrite');
  tx.objectStore(STORE_PROFILES).put(profile);
  return new Promise(function (resolve, reject) {
    tx.oncomplete = function () { resolve(); };
    tx.onerror = function () { reject(tx.error); };
  });
}

export async function getProfile(user_id) {
  const db = await openDB();
  const tx = db.transaction(STORE_PROFILES, 'readonly');
  const store = tx.objectStore(STORE_PROFILES);
  const request = store.get(user_id);
  return new Promise(function (resolve, reject) {
    request.onsuccess = function () { resolve(request.result || null); };
    request.onerror = function () { reject(request.error); };
  });
}

export async function getDefaultProfile() {
  return {
    user_id: 'default_user',
    lar_threshold: lar_threshold,
    f_min: f_min,
    f_max: f_max,
  };
}

export { STORE_PROFILES };
