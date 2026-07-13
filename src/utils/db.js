const DB_NAME = 'VNADA_DB';
const DB_VERSION = 1;

const STORE_PROFILES = 'user_profiles';
const STORE_SESSIONS = 'training_sessions';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_PROFILES)) {
        const profileStore = db.createObjectStore(STORE_PROFILES, { keyPath: 'user_id' });
        profileStore.createIndex('user_id', 'user_id', { unique: true });
      }

      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        const sessionStore = db.createObjectStore(STORE_SESSIONS, { keyPath: 'session_id' });
        sessionStore.createIndex('timestamp', 'timestamp', { unique: false });
        sessionStore.createIndex('module_type', 'module_type', { unique: false });
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

export async function saveSession(session) {
  const db = await openDB();
  const tx = db.transaction(STORE_SESSIONS, 'readwrite');
  tx.objectStore(STORE_SESSIONS).put(session);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getSessionsByModule(moduleType) {
  const db = await openDB();
  const tx = db.transaction(STORE_SESSIONS, 'readonly');
  const store = tx.objectStore(STORE_SESSIONS);
  const index = store.index('module_type');
  const request = index.getAll(moduleType);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllSessions() {
  const db = await openDB();
  const tx = db.transaction(STORE_SESSIONS, 'readonly');
  const store = tx.objectStore(STORE_SESSIONS);
  const request = store.getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export { STORE_PROFILES, STORE_SESSIONS };
