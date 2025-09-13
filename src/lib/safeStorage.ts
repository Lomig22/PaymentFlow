// src/lib/safeStorage.ts
export async function safeReadStorage(storage: Storage, key: string, maxSize = 1000000) {
  const raw = await storage.getItem(key);
  if (!raw) return null;

  if (typeof raw === "string" && raw.length > maxSize) {
    storage.removeItem(key);
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
